import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { deleteS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import {
  deleteS3Events,
  eventTimeStamp,
  generatePublishAndValidateEvents,
  TableNames,
  TimeStamps,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { publishSNS } from "../../src/handlers/int-test-support/helpers/snsHelper";
import {
  ClientId,
  EventName,
  snsInvalidEventNamePayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYear } from "../../src/handlers/int-test-support/helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nExecute athena transaction curated query to retrieve price \n", () => {
  beforeAll(async () => {
    await deleteS3Objects({ bucketName, prefix: "btm_transactions" });
  });

  test.each`
    eventName                          | clientId     | numberOfTestEvents | unitPrice | eventTime
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${2}               | ${1.23}   | ${TimeStamps.THIS_TIME_LAST_YEAR}
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client2"} | ${2}               | ${2.5}    | ${TimeStamps.CURRENT_TIME}
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client3"} | ${7}               | ${4.0}    | ${TimeStamps.CURRENT_TIME}
    ${"IPV_ADDRESS_CRI_END"}           | ${"client3"} | ${14}              | ${8.88}   | ${TimeStamps.CURRENT_TIME}
  `(
    "price retrieved from transaction_curated athena view query should match with expected calculated price for $numberOfTestEvents",
    async ({
      eventName,
      clientId,
      numberOfTestEvents,
      unitPrice,
      eventTime,
    }: {
      clientId: ClientId;
      eventName: EventName;
      numberOfTestEvents: number;
      unitPrice: number;
      eventTime: TimeStamps;
      year: number;
    }) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
      const eventIds = await generatePublishAndValidateEvents({
        numberOfTestEvents,
        eventName,
        clientId,
        eventTime,
      });
      const tableName = TableNames.TRANSACTION_CURATED;
      const year = new Date(eventTimeStamp[eventTime] * 1000).getFullYear();
      const response: TransactionCuratedView[] =
        await queryResponseFilterByVendorServiceNameYear({
          clientId,
          eventName,
          tableName,
          year,
        });
      await deleteS3Events(eventIds, eventTime);
      expect(response[0].price).toEqual(expectedPrice);
    }
  );

  test("no results returned from transaction_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const tableName = TableNames.TRANSACTION_CURATED;
    const year = new Date(
      snsInvalidEventNamePayload.timestamp * 1000
    ).getFullYear();
    const queryRes = await queryResponseFilterByVendorServiceNameYear({
      clientId: snsInvalidEventNamePayload.client_id,
      eventName: snsInvalidEventNamePayload.event_name,
      tableName,
      year,
    });
    expect(queryRes.length).not.toBeGreaterThan(0);
  });
});

interface TransactionCuratedView {
  vendor_name: string;
  service_name: string;
  price: number;
  quantity: number;
  year: string;
  month: string;
}

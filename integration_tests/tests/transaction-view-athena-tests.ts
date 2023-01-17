import { resourcePrefix } from "../helpers/envHelper";
import {
  deleteS3Events,
  eventTimeStamp,
  generatePublishAndValidateEvents,
  TableNames,
  TimeStamps,
} from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";

import {
  ClientId,
  EventName,
  snsInvalidEventNamePayload,
} from "../payloads/snsEventPayload";
import { deleteDirectoryRecursiveInS3 } from "../helpers/s3Helper";
import {  queryResponseFilterByVendorServiceNameYear } from "../helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nExecute athena transaction curated query to retrive price \n", () => {
  beforeAll(async () => {
    await deleteDirectoryRecursiveInS3(bucketName, "btm_transactions");
  });

  test.each`
    eventName                          | clientId     | numberOfTestEvents | unitPrice | eventTime
    ${"EVENT_1"} | ${"client1"} | ${2}               | ${1.23}   | ${TimeStamps.THIS_TIME_LAST_YEAR}
    ${"EVENT_1"} | ${"client2"} | ${2}               | ${2.5}    | ${TimeStamps.CURRENT_TIME}
    ${"EVENT_1"} | ${"client3"} | ${7}               | ${4.0}    | ${TimeStamps.CURRENT_TIME}
    ${"EVENT_6"}           | ${"client3"} | ${14}              | ${8.88}   | ${TimeStamps.CURRENT_TIME}
  `(
    "price retrived from transaction_curated athena view query should match with expected calculated price for $numberOfTestEvents",
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
      year:number
    }) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
      const eventIds = await generatePublishAndValidateEvents({
        numberOfTestEvents,
        eventName,
        clientId,
        eventTime,
      });
      const tableName = TableNames.TRANSACTION_CURATED;
      const year = new Date(eventTimeStamp[eventTime] * 1000).getFullYear()
      const response: TransactionCuratedView[] =
        await queryResponseFilterByVendorServiceNameYear({
          clientId,
          eventName,
          tableName,year
        });
      await deleteS3Events(eventIds, eventTime);
      expect(response[0].price).toEqual(expectedPrice);
    }
  );

  test("no results returned from transaction_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const tableName = TableNames.TRANSACTION_CURATED;
    const year = new Date(snsInvalidEventNamePayload.timestamp * 1000).getFullYear()
    const queryRes = await queryResponseFilterByVendorServiceNameYear({
      clientId: snsInvalidEventNamePayload.client_id,
      eventName: snsInvalidEventNamePayload.event_name,
      tableName,year
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

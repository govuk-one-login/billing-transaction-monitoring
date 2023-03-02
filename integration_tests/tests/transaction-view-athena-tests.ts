import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { deleteS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import {
  deleteS3Events,
  eventTimeStamp,
  generatePublishAndValidateEvents,
  TableNames,
  TimeStamps,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  VendorId,
  EventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYear } from "../../src/handlers/int-test-support/helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nExecute athena transaction curated query to retrieve price \n", () => {
  beforeAll(async () => {
    await deleteS3Objects({ bucketName, prefix: "btm_transactions" });
  });

  test.each`
    eventName             | vendorId                | numberOfTestEvents | unitPrice | eventTime
    ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${2}               | ${1.23}   | ${TimeStamps.THIS_TIME_LAST_YEAR}
    ${"VENDOR_2_EVENT_2"} | ${"vendor_testvendor2"} | ${2}               | ${2.5}    | ${TimeStamps.CURRENT_TIME}
    ${"VENDOR_3_EVENT_4"} | ${"vendor_testvendor3"} | ${7}               | ${4.0}    | ${TimeStamps.CURRENT_TIME}
    ${"VENDOR_3_EVENT_6"} | ${"vendor_testvendor3"} | ${14}              | ${8.88}   | ${TimeStamps.CURRENT_TIME}
  `(
    "price retrieved from transaction_curated athena view query should match with expected calculated price for $numberOfTestEvents",
    async ({
      eventName,
      vendorId,
      numberOfTestEvents,
      unitPrice,
      eventTime,
    }: {
      vendorId: VendorId;
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
        eventTime,
      });
      const tableName = TableNames.TRANSACTION_CURATED;
      const year = new Date(eventTimeStamp[eventTime] * 1000).getFullYear();
      const response: TransactionCuratedView[] =
        await queryResponseFilterByVendorServiceNameYear({
          vendorId,
          eventName,
          tableName,
          year,
        });
      await deleteS3Events(eventIds, eventTime);
      expect(response[0].price).toEqual(expectedPrice);
    }
  );
});

interface TransactionCuratedView {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  price: number;
  quantity: number;
  year: string;
  month: string;
}

import {
  checkS3BucketForEventId,
  generateTestCleanedEvent,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  VendorId,
  EventName,
  CleanedEventPayload,
  prettyEventNameMap,
  prettyVendorNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import {
  S3Object,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { getQueryResponse } from "../../src/handlers/int-test-support/helpers/queryHelper";

describe("\nUpload events to s3 directly and check the transaction curated view \n", () => {
  test.each`
    eventName             | vendorId                | numberOfTestCredits | unitPrice | eventTime
    ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${2}                | ${1.23}   | ${"2005/06/30 10:00"}
    ${"VENDOR_2_EVENT_2"} | ${"vendor_testvendor2"} | ${2}                | ${2.5}    | ${"2005/07/10 10:00"}
    ${"VENDOR_3_EVENT_4"} | ${"vendor_testvendor3"} | ${7}                | ${4.0}    | ${"2005/08/10 10:00"}
    ${"VENDOR_3_EVENT_6"} | ${"vendor_testvendor3"} | ${14}               | ${8.88}   | ${"2005/09/10 10:00"}
  `(
    "data retrieved from transaction_curated athena view should match the input data $eventName, $vendorId, $numberOfTestCredits, $eventTime",
    async ({
      eventName,
      vendorId,
      numberOfTestCredits,
      unitPrice,
      eventTime,
    }: {
      vendorId: VendorId;
      eventName: EventName;
      numberOfTestCredits: number;
      unitPrice: number;
      year: number;
      eventTime: string;
    }) => {
      const expectedPrice = (numberOfTestCredits * unitPrice).toFixed(4);
      let totalCredits = 0;
      while (totalCredits < numberOfTestCredits) {
        const creditsLeft = numberOfTestCredits - totalCredits;
        const credits = Math.floor(Math.random() * creditsLeft + 1);
        const eventPayload: CleanedEventPayload =
          await generateTestCleanedEvent({
            event_name: eventName,
            vendor_id: vendorId,
            timestamp_formatted: eventTime,
            timestamp: new Date(eventTime).getTime(),
            credits,
          });
        const prefix = resourcePrefix();
        const s3Object: S3Object = {
          bucket: `${prefix}-storage`,
          key: `${"btm_event_data"}/${eventPayload.timestamp_formatted.slice(
            0,
            10
          )}/${eventPayload.event_id}.json`,
        };
        await putS3Object({
          data: JSON.stringify(eventPayload),
          target: s3Object,
        });
        const eventExistsInS3 = await checkS3BucketForEventId(
          eventPayload.event_id,
          7000
        );
        expect(eventExistsInS3).toBe(true);
        totalCredits = totalCredits + credits;
      }
      const tableName = TableNames.TRANSACTION_CURATED;
      const prettyEventName = prettyEventNameMap[eventName];
      const response = await getQueryResponse<TransactionCurated>(
        tableName,
        vendorId,
        prettyEventName,
        eventTime
      );
      expect(response.length).toBe(1);
      expect(response[0].vendor_id).toBe(vendorId);
      expect(response[0].vendor_name).toBe(prettyVendorNameMap[vendorId]);
      expect(response[0].event_name).toBe(eventName);
      expect(response[0].price).toEqual(expectedPrice);
      expect(response[0].quantity).toBe(numberOfTestCredits.toString());
      expect(response[0].year).toEqual(
        new Date(eventTime).getFullYear().toString()
      );
      expect(response[0].month).toEqual(
        new Date(eventTime).toLocaleString("en-US", {
          month: "2-digit",
        })
      );
    }
  );
});

type TransactionCurated = Array<{
  vendor_id: string;
  vendor_name: string;
  event_name: string;
  service_name: string;
  price: string;
  quantity: string;
  year: string;
  month: string;
}>;

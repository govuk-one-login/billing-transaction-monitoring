import {
  generateTestEvent,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  VendorId,
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { getFilteredQueryResponse } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { generateEventViaFilterLambdaAndCheckEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\nExecute athena transaction curated query to retrieve price \n", () => {
  test.each`
    eventName             | vendorId                | numberOfTestEvents | unitPrice | eventTime
    ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${2}               | ${1.23}   | ${"2005/06/30 10:00"}
    ${"VENDOR_2_EVENT_2"} | ${"vendor_testvendor2"} | ${2}               | ${2.5}    | ${"2005/07/10 10:00"}
    ${"VENDOR_3_EVENT_4"} | ${"vendor_testvendor3"} | ${7}               | ${4.0}    | ${"2005/08/10 10:00"}
    ${"VENDOR_3_EVENT_6"} | ${"vendor_testvendor3"} | ${14}              | ${8.88}   | ${"2005/09/10 10:00"}
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
      year: number;
      eventTime: string;
    }) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
      for (let i = 0; i < numberOfTestEvents; i++) {
        const eventPayload = await generateTestEvent({
          event_name: eventName,
          timestamp_formatted: eventTime,
          timestamp: new Date(eventTime).getTime() / 1000,
        });
        await generateEventViaFilterLambdaAndCheckEventInS3Bucket(eventPayload);
      }
      const tableName = TableNames.TRANSACTION_CURATED;
      const prettyEventName = prettyEventNameMap[eventName];
      const response = await getFilteredQueryResponse<TransactionCurated>(
        tableName,
        vendorId,
        prettyEventName,
        eventTime
      );
      expect(response.length).toBe(1);
      expect(response[0].price).toEqual(expectedPrice);
    }
  );
});

interface TransactionCurated {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  price: string;
  quantity: string;
  year: string;
  month: string;
}

import {
  deleteS3Events,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  VendorId,
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { generateTransactionEventsViaFilterLambda } from "../../src/handlers/int-test-support/testDataHelper";

describe("\nExecute athena transaction curated query to retrieve price \n", () => {
  let eventIds: string[];
  let eventTimestamp: string;

  test.each`
    eventName             | vendorId                | numberOfTestEvents | unitPrice | eventTime
    ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${2}               | ${1.23}   | ${"2022/06/30 10:00"}
    ${"VENDOR_2_EVENT_2"} | ${"vendor_testvendor2"} | ${2}               | ${2.5}    | ${"2023/02/10 10:00"}
    ${"VENDOR_3_EVENT_4"} | ${"vendor_testvendor3"} | ${7}               | ${4.0}    | ${"2022/08/10 10:00"}
    ${"VENDOR_3_EVENT_6"} | ${"vendor_testvendor3"} | ${14}              | ${8.88}   | ${"2022/09/10 10:00"}
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
      eventTimestamp = eventTime;
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);

      eventIds = await generateTransactionEventsViaFilterLambda(
        eventTime,
        numberOfTestEvents,
        eventName
      );

      const tableName = TableNames.TRANSACTION_CURATED;
      const prettyEventName = prettyEventNameMap[eventName];

      const response: TransactionCuratedView[] =
        await queryResponseFilterByVendorServiceNameYearMonth(
          vendorId,
          prettyEventName,
          tableName,
          eventTime
        );

      expect(response[0].price).toEqual(expectedPrice);
    }
  );

  afterEach(async () => {
    await deleteS3Events(eventIds, eventTimestamp);
  });
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

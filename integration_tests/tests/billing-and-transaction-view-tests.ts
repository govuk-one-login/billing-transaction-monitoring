import {
  checkStandardised,
  createInvoiceWithGivenData,
  createInvoiceInS3,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { TestData } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import {
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import {
  generateTestEvents,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { getQueryResponse } from "../../src/handlers/int-test-support/helpers/queryHelper";

describe("\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n", () => {
  test.each`
    testCase                                                                                                  | eventName             | vendorId                | eventTime             | invoiceTime     | unitPrice | numberOfTestCredits | priceDifferencePercentage | billingPriceFormatted | billingQty | transactionPriceFormatted | transactionQty
    ${"BillingQty equals TransactionQty and No TransactionPrice No BillingPrice "}                            | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2005/03/30 10:00"} | ${"2005/03/30"} | ${"0.00"} | ${2}                | ${"-1234567.01"}          | ${"£0.00"}            | ${"2"}     | ${"£0.00"}                | ${"2"}
    ${"BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice "}                    | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2005/02/28 10:00"} | ${"2005/02/28"} | ${"0.00"} | ${11}               | ${"-100.0"}               | ${"£0.00"}            | ${"2"}     | ${"£27.50"}               | ${"11"}
    ${"BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice"}                  | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2005/04/30 10:00"} | ${"2005/04/30"} | ${"2.50"} | ${2}                | ${"-1234567.05"}          | ${"£27.50"}           | ${"11"}    | ${"£0.00"}                | ${"2"}
    ${"BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice"}                      | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${"2005/05/30 10:00"} | ${"2005/05/30"} | ${"3.33"} | ${2}                | ${"170.7317"}             | ${"£6.66"}            | ${"2"}     | ${"£2.46"}                | ${"2"}
    ${"BillingQty equals TransactionQty for quarterly invoice in different month but same quarter as events"} | ${"VENDOR_6_EVENT_1"} | ${"vendor_testvendor6"} | ${"2005/05/30 10:00"} | ${"2005/04/01"} | ${"3.33"} | ${2}                | ${"0"}                    | ${"£6.66"}            | ${"2"}     | ${"£3.33"}                | ${"2"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQty,$billingPriceFormatted,$transactionQty,$transactionPriceFormatted,$priceDifferencePercentage",
    async ({ ...data }) => {
      await generateTestEvents(
        data.eventTime,
        data.transactionQty,
        data.eventName
      );
      const { invoiceData, filename } = await createInvoiceWithGivenData(
        data,
        "Passport Check",
        data.unitPrice,
        data.vendorId,
        data.vendorName,
        "pdf"
      );

      await createInvoiceInS3({ invoiceData, filename });

      // Check they were standardised
      await checkStandardised(
        new Date(data.eventTime),
        data.vendorId,
        { description: "Passport Check", event_name: data.eventName },
        "Passport Check"
      );

      const eventName: EventName = data.eventName;
      const prettyEventName = prettyEventNameMap[eventName];

      await assertQueryResultWithTestData(
        data,
        data.eventTime,
        data.vendorId,
        prettyEventName
      );
    }
  );
});

export const assertQueryResultWithTestData = async (
  {
    billingPriceFormatted,
    transactionPriceFormatted,
    priceDifferencePercentage,
  }: TestData,
  eventTime: string,
  vendorId: string,
  serviceName: string
): Promise<void> => {
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const response = await getQueryResponse<BillingTransactionCurated>(
    tableName,
    vendorId,
    serviceName,
    eventTime
  );
  expect(response.length).toBe(1);
  expect(response[0].billing_price_formatted).toEqual(billingPriceFormatted);
  expect(response[0].transaction_price_formatted).toEqual(
    transactionPriceFormatted
  );
  expect(response[0].price_difference_percentage).toEqual(
    priceDifferencePercentage
  );
};

export type BillingTransactionCurated = Array<{
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  year: string;
  month: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference_percentage: string;
}>;

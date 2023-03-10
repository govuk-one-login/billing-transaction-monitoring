import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { deleteS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";

import { createInvoiceWithGivenData } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

import {
  generateTransactionEventsViaFilterLambda,
  TestData,
} from "../../src/handlers/int-test-support/testDataHelper";
import {
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nUpload invoice to raw invoice bucket and verify billing and transaction_curated view query results matches with expected data \n", () => {
  beforeAll(async () => {
    // tests are enabled to run sequentially as we are deleting the S3 directory in view tests so when running the test
    // in parallel other tests will be interrupted(e.g. sns-s3 tests generate and checks eventId). We can enable to run in parallel
    // once we implement BTM-340 to clean up after each test
    await deleteS3Objects({ bucketName, prefix: "btm_billing_standardised" });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-02-28",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-03-30",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-04-30",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-05-30",
    });
  });

  test.each`
    testCase                                                                                 | eventName             | vendorId                | eventTime             | unitPrice | numberOfTestEvents | priceDiff     | qtyDiff | priceDifferencePercent | qtyDifferencePercent | billingPrice | billingQty | transactionPrice | transactionQty
    ${"BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice "}   | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/02/28 10:00"} | ${"0.00"} | ${11}              | ${"-27.5000"} | ${"-9"} | ${"-100.0000"}         | ${"-81"}             | ${"0.0000"}  | ${"2"}     | ${"27.5000"}     | ${"11"}
    ${"BillingQty equals TransactionQty and No TransactionPrice No BillingPrice "}           | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/03/30 10:00"} | ${"0.00"} | ${2}               | ${"0.0000"}   | ${"0"}  | ${"0.0000"}            | ${"0"}               | ${"0.0000"}  | ${"2"}     | ${"0.0000"}      | ${"2"}
    ${"BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice"} | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/04/30 10:00"} | ${"2.50"} | ${2}               | ${"27.5000"}  | ${"9"}  | ${undefined}           | ${"450"}             | ${"27.5000"} | ${"11"}    | ${"0.0000"}      | ${"2"}
    ${"BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice"}     | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${"2022/05/30 10:00"} | ${"3.33"} | ${2}               | ${"4.2000"}   | ${"0"}  | ${"170.7317"}          | ${"0"}               | ${"6.6600"}  | ${"2"}     | ${"2.4600"}      | ${"2"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQty,$billingPrice,$transactionQty,$transactionPrice,$qtyDiff,$priceDiff,$qtyDifferencePercent,$priceDifferencePercent",
    async ({ ...data }) => {
      await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        data.eventName
      );
      const testStartTime = new Date();
      await createInvoiceWithGivenData(
        data,
        "Passport Check",
        data.unitPrice,
        data.vendorId,
        data.vendorName,
        testStartTime
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
    billingQty,
    transactionQty,
    priceDiff,
    qtyDiff,
    priceDifferencePercent,
    qtyDifferencePercent,
    billingPrice,
    transactionPrice,
  }: TestData,
  eventTime: string,
  vendorId: string,
  serviceName: string
): Promise<void> => {
  const response = await queryResponseFilterByVendorServiceNameYearMonth(
    eventTime,
    vendorId,
    serviceName
  );
  expect(response[0].price_difference).toEqual(priceDiff);
  expect(response[0].quantity_difference).toEqual(qtyDiff);
  expect(response[0].price_difference_percentage).toEqual(
    priceDifferencePercent
  );
  expect(response[0].quantity_difference_percentage).toEqual(
    qtyDifferencePercent
  );
  expect(response[0].billing_price).toEqual(billingPrice);
  expect(response[0].billing_quantity).toEqual(billingQty);
  expect(response[0].transaction_price).toEqual(transactionPrice);
  expect(response[0].transaction_quantity).toEqual(transactionQty);
};

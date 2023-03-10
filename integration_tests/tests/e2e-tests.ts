import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { createInvoiceWithGivenData } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { deleteS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";

import {
  generateTransactionEventsViaFilterLambda,
  retrieveMoreTestDataFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/testDataHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

let eventName: string;
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

describe("\n Upload invoice to raw invoice bucket and verify billing and transaction_curated view query results matches with expected data \n", () => {
  beforeAll(async () => {
    await deleteS3Objects({ bucketName, prefix: "btm_billing_standardised" });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-11-30",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-12-01",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2023-01-01",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2023-02-28",
    });
    dataRetrievedFromConfig = await retrieveMoreTestDataFromConfig();
    eventName = dataRetrievedFromConfig.eventName;
    console.log(eventName);
  });

  test.each`
    testCase                                                                               | eventTime       | transactionQty | billingQty
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price"} | ${"2022/10/30"} | ${undefined}   | ${"100"}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                | ${"2022/11/30"} | ${"10"}        | ${"10"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}          | ${"2022/12/01"} | ${"10"}        | ${"12"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}           | ${"2023/01/01"} | ${"10"}        | ${"6"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        eventName
      );
      const testStartTime = new Date();
      await createInvoiceWithGivenData(
        data,
        dataRetrievedFromConfig.description,
        dataRetrievedFromConfig.unitPrice,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.vendorName,
        testStartTime
      );
      await assertQueryResultWithTestData(
        data,
        dataRetrievedFromConfig.unitPrice,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName
      );
    }
  );

  test.each`
    testCase                                                                                 | eventTime       | transactionQty | billingQty
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2023/02/28"} | ${"1"}         | ${undefined}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        eventName
      );

      await assertQueryResultWithTestData(
        data,
        dataRetrievedFromConfig.unitPrice,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName
      );
    }
  );
});

export const assertQueryResultWithTestData = async (
  { billingQty, transactionQty, eventTime }: TestData,
  unitPrice: number,
  vendorId: string,
  serviceName: string
): Promise<void> => {
  const response = await queryResponseFilterByVendorServiceNameYearMonth(
    eventTime,
    vendorId,
    serviceName
  );
  const billingPrice = unitPrice * billingQty;
  console.log(transactionQty);
  const transactionPrice = unitPrice * transactionQty;

  expect(response[0].billing_quantity).toEqual(billingQty);
  expect(response[0].transaction_quantity).toEqual(transactionQty);

  if (!isNaN(billingPrice) || isNaN(transactionPrice)) {
    expect(response[0].transaction_price).toEqual(transactionPrice.toFixed(4));
    expect(response[0].billing_price).toEqual(billingPrice.toFixed(4));
    const priceDifference = billingPrice - transactionPrice;
    expect(response[0].price_difference).toEqual(priceDifference.toFixed(4));
    const priceDifferencePercentage =
      (billingPrice - transactionPrice / billingPrice) * 100;
    expect(response[0].price_difference_percentage).toEqual(
      priceDifferencePercentage.toFixed(4)
    );
  }
  if (!isNaN(billingQty)) {
    const qtyDifference = billingQty - transactionQty;
    expect(response[0].quantity_difference).toEqual(String(qtyDifference));

    const qtyDifferencePercentage = (qtyDifference / billingQty) * 100;
    expect(response[0].quantity_difference_percentage).toEqual(
      qtyDifferencePercentage
    );
  }
};

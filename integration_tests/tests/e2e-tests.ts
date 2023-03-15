import {
  deleteS3Events,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { createInvoiceWithGivenData } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { deleteS3Object } from "../../src/handlers/int-test-support/helpers/s3Helper";

import {
  generateTransactionEventsViaFilterLambda,
  retrieveMoreTestDataFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/testDataHelper";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;
const standardisedFolderPrefix = "btm_billing_standardised";
let eventName: string;
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

describe("\n Upload invoice to raw invoice bucket and verify billing and transaction_curated view query results matches with expected data \n", () => {
  beforeAll(async () => {
    dataRetrievedFromConfig = await retrieveMoreTestDataFromConfig();
    eventName = dataRetrievedFromConfig.eventName;
  });
  let invoiceFileName: string;
  let eventIds: string[];
  let eventTime: string;

  test.each`
    testCase                                                                               | eventTime       | transactionQty | billingQty
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price"} | ${"2022/10/30"} | ${undefined}   | ${"100"}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                | ${"2022/11/30"} | ${"10"}        | ${"10"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}          | ${"2022/12/01"} | ${"10"}        | ${"12"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}           | ${"2023/01/02"} | ${"10"}        | ${"6"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      eventIds = await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        eventName
      );
      eventTime = data.eventTime;

      invoiceFileName = await createInvoiceWithGivenData(
        data,
        dataRetrievedFromConfig.description,
        dataRetrievedFromConfig.unitPrice,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.vendorName
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
      eventIds = await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        eventName
      );
      eventTime = data.eventTime;
      await assertQueryResultWithTestData(
        data,
        dataRetrievedFromConfig.unitPrice,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName
      );
    }
  );

  afterEach(async () => {
    await deleteS3Events(eventIds, eventTime);
    await deleteS3Object({
      bucket: storageBucket,
      key: `${standardisedFolderPrefix}/${invoiceFileName.slice(0, 27)}.txt`,
    });
  });
});

export const assertQueryResultWithTestData = async (
  { billingQty, transactionQty, eventTime }: TestData,
  unitPrice: number,
  vendorId: string,
  serviceName: string
): Promise<void> => {
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const response: BillingTransactionCurated =
    await queryResponseFilterByVendorServiceNameYearMonth(
      vendorId,
      serviceName,
      tableName,
      eventTime
    );

  const billingPrice = unitPrice * billingQty;
  const transactionPrice = unitPrice * transactionQty;
  const qtyDifference = billingQty - transactionQty;
  const priceDifference = billingPrice - transactionPrice;
  const priceDifferencePercentage = (
    (priceDifference / transactionPrice) *
    100
  ).toFixed(4);
  const qtyDifferencePercentage = (qtyDifference / transactionQty) * 100;

  if (billingQty !== undefined && transactionQty !== undefined) {
    expect(response[0].billing_quantity).toEqual(billingQty);
    expect(response[0].transaction_quantity).toEqual(transactionQty);
    expect(response[0].quantity_difference).toEqual(qtyDifference.toString());
    expect(response[0].quantity_difference_percentage).toEqual(
      String(qtyDifferencePercentage)
    );
    expect(response[0].transaction_price).toEqual(transactionPrice.toFixed(4));
    expect(response[0].price_difference).toEqual(priceDifference.toFixed(4));
    expect(response[0].billing_price).toEqual(billingPrice.toFixed(4));
    expect(response[0].price_difference_percentage).toEqual(
      priceDifferencePercentage
    );
  } else if (billingQty !== undefined && transactionQty === undefined) {
    expect(response[0].billing_quantity).toEqual(billingQty);
    expect(response[0].billing_price).toEqual(billingPrice.toFixed(4));

    expect(response[0].quantity_difference).toEqual(
      (billingQty - 0).toString()
    );
    expect(response[0].quantity_difference_percentage).toEqual(undefined);

    expect(response[0].price_difference).toEqual((billingPrice - 0).toFixed(4));
    expect(response[0].price_difference_percentage).toEqual(undefined);
  } else if (transactionQty !== undefined && billingQty === undefined) {
    expect(response[0].transaction_quantity).toEqual(transactionQty);
    expect(response[0].transaction_price).toEqual(transactionPrice.toFixed(4));

    expect(response[0].quantity_difference_percentage).toEqual(
      String(0 - transactionQty * 100)
    );
    expect(response[0].quantity_difference).toEqual(
      (-transactionQty).toString()
    );
    expect(response[0].price_difference).toEqual(
      String((0 - transactionPrice).toFixed(4))
    );
    expect(response[0].price_difference_percentage).toEqual(
      String((((0 - transactionPrice) / transactionPrice) * 100).toFixed(4))
    );
  }
};

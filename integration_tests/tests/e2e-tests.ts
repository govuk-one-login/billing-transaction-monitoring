import {
  deleteS3Events,
  poll,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  createInvoiceInS3,
  createInvoiceWithGivenData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  deleteS3Object,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

import {
  generateTransactionEventsViaFilterLambda,
  retrieveMoreTestDataFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;
const standardisedFolderPrefix = "btm_billing_standardised";
let eventName: string;
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

// Below tests can be run both in lower and higher environments
// TODO: CSV e2e test

describe("\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n", () => {
  beforeAll(async () => {
    dataRetrievedFromConfig = await retrieveMoreTestDataFromConfig();
    eventName = dataRetrievedFromConfig.eventName;
  });
  let filename: string;
  let eventIds: string[];
  let eventTime: string;

  test.each`
    testCase                                                                               | eventTime       | transactionQty | billingQty
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price"} | ${"2022/10/30"} | ${undefined}   | ${"100"}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                | ${"2022/11/30"} | ${"10"}        | ${"10"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}          | ${"2022/12/01"} | ${"10"}        | ${"12"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}           | ${"2023/01/02"} | ${"10"}        | ${"6"}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      eventIds = await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        eventName
      );
      eventTime = data.eventTime;

      filename = `e2e-test-raw-Invoice-validFile`;

      const invoiceData = createInvoiceWithGivenData(
        data,
        dataRetrievedFromConfig.description,
        dataRetrievedFromConfig.unitPrice,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.vendorName
      );
      await createInvoiceInS3({ invoiceData, filename: `${filename}.pdf` });

      // Wait for the invoice data to have been written, to some file in the standardised folder.
      await poll(
        async () =>
          await listS3Objects({
            bucketName: storageBucket,
            prefix: standardisedFolderPrefix,
          }),
        ({ Contents }) =>
          !!Contents?.some(
            (s3Object) =>
              s3Object.Key !== undefined &&
              s3Object.Key === `${standardisedFolderPrefix}/${filename}.txt`
          ),
        {
          timeout: 55000,
          nonCompleteErrorMessage:
            "Invoice data never appeared in standardised folder",
        }
      );

      const expectedResults = calculateExpectedResults(
        data,
        dataRetrievedFromConfig.unitPrice
      );
      await assertQueryResultWithTestData(
        expectedResults,
        eventTime,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName
      );
    }
  );

  test.each`
    testCase                                                                                 | eventTime       | transactionQty | billingQty
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2023/02/28"} | ${"1"}         | ${undefined}
  `(
    "results retrieved from BillingAndTransactionsCuratedView should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      eventIds = await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        eventName
      );
      eventTime = data.eventTime;
      const expectedResults = calculateExpectedResults(
        data,
        dataRetrievedFromConfig.unitPrice
      );
      await assertQueryResultWithTestData(
        expectedResults,
        eventTime,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName
      );
    }
  );

  afterEach(async () => {
    await deleteS3Events(eventIds, eventTime);
    await deleteS3Object({
      bucket: storageBucket,
      key: `${standardisedFolderPrefix}/${filename}.txt`,
    });
  });
});

export const assertQueryResultWithTestData = async (
  expectedResults: Record<string, any>,
  eventTime: string,
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
  expect(response[0].billing_quantity).toEqual(expectedResults.billingQty);
  expect(response[0].transaction_quantity).toEqual(
    expectedResults.transactionQty
  );
  expect(response[0].quantity_difference).toEqual(
    expectedResults.qtyDifference
  );
  expect(response[0].quantity_difference_percentage).toEqual(
    expectedResults.qtyDifferencePercentage
  );
  expect(response[0].billing_price).toEqual(expectedResults.billingPrice);
  expect(response[0].transaction_price).toEqual(
    expectedResults.transactionPrice
  );
  expect(response[0].price_difference).toEqual(expectedResults.priceDifference);
  expect(response[0].price_difference_percentage).toEqual(
    expectedResults.priceDifferencePercentage
  );
};

const calculateExpectedResults = (
  { billingQty, transactionQty }: TestData,
  unitPrice: number
): ExpectedResults => {
  const billingPrice = unitPrice * billingQty;
  const transactionPrice = unitPrice * transactionQty;
  const qtyDifference = billingQty - transactionQty;
  const priceDifference = billingPrice - transactionPrice;
  const priceDifferencePercentage = (priceDifference / transactionPrice) * 100;
  const qtyDifferencePercentage = (qtyDifference / transactionQty) * 100;

  if (billingQty === undefined) {
    return {
      transactionQty,
      qtyDifference: (-transactionQty).toString(),
      qtyDifferencePercentage: (-transactionQty * 100).toString(),
      transactionPrice: transactionPrice.toFixed(4),
      priceDifference: (-transactionPrice).toFixed(4).toString(),
      priceDifferencePercentage: (-100).toFixed(4),
      billingQty: undefined,
      billingPrice: undefined,
    };
  }
  if (transactionQty === undefined) {
    return {
      billingQty,
      qtyDifference: billingQty.toString(),
      qtyDifferencePercentage: undefined,
      billingPrice: billingPrice.toFixed(4),
      priceDifference: billingPrice.toFixed(4),
      priceDifferencePercentage: undefined,
      transactionQty: undefined,
      transactionPrice: undefined,
    };
  } else {
    return {
      billingQty,
      transactionQty,
      qtyDifference: qtyDifference.toString(),
      qtyDifferencePercentage: qtyDifferencePercentage.toString(),
      transactionPrice: transactionPrice.toFixed(4),
      priceDifference: priceDifference.toFixed(4).toString(),
      billingPrice: billingPrice.toFixed(4),
      priceDifferencePercentage: priceDifferencePercentage.toFixed(4),
    };
  }
};

interface ExpectedResults {
  billingQty: number | undefined;
  transactionQty: number | undefined;
  qtyDifference: number | string;
  qtyDifferencePercentage: string | undefined;
  transactionPrice: string | undefined;
  priceDifference: number | string;
  billingPrice: number | undefined | string;
  priceDifferencePercentage: string | undefined;
}

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
  getVendorServiceAndRatesFromConfig,
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
    dataRetrievedFromConfig = await getVendorServiceAndRatesFromConfig();
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
    "results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
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

  test.skip.each`
    testCase                                                                                 | eventTime       | transactionQty | billingQty
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2023/02/28"} | ${"1"}         | ${undefined}
  `(
    "results retrieved from BillingAndTransactionsCuratedView should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
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

  expect(response[0].billing_price_formatted).toEqual(
    expectedResults.billingPriceFormatted
  );
  expect(response[0].transaction_price_formatted).toEqual(
    expectedResults.transactionPriceFormatted
  );
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
  const priceDifference = billingPrice - transactionPrice;
  const priceDifferencePercentage = (priceDifference / transactionPrice) * 100;

  if (billingQty === undefined) {
    return {
      transactionQty,
      transactionPriceFormatted: "£" + transactionPrice.toFixed(2),
      priceDifferencePercentage: (-100).toFixed(1),
      billingQty: undefined,
      billingPriceFormatted: undefined,
    };
  }
  if (transactionQty === undefined) {
    return {
      billingQty,
      billingPriceFormatted: "£" + billingPrice.toFixed(2),
      priceDifferencePercentage: "-1234567.04",
      transactionQty: undefined,
      transactionPriceFormatted: undefined,
    };
  } else {
    return {
      billingQty,
      transactionQty,
      transactionPriceFormatted: "£" + transactionPrice.toFixed(2),
      billingPriceFormatted: "£" + billingPrice.toFixed(2),
      priceDifferencePercentage: priceDifferencePercentage.toFixed(1),
    };
  }
};

interface ExpectedResults {
  billingQty: number | undefined;
  transactionQty: number | undefined;
  transactionPriceFormatted: string | undefined;
  billingPriceFormatted: number | undefined | string;
  priceDifferencePercentage: string | undefined;
}

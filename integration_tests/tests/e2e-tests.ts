import {
  generateTestEvent,
  getYearMonth,
  poll,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  createInvoiceInS3,
  createInvoiceWithGivenData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { getFilteredQueryResponse } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";

import {
  generateEventViaFilterLambdaAndCheckEventInS3Bucket,
  getVendorServiceAndRatesFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import crypto from "crypto";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";

const prefix = resourcePrefix();
let eventName: string;
const storageBucket = `${prefix}-storage`;
const standardisedFolderPrefix = "btm_invoice_data";
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

// Below tests can be run both in lower and higher environments
// TODO: CSV e2e test

describe("\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n", () => {
  beforeAll(async () => {
    dataRetrievedFromConfig = await getVendorServiceAndRatesFromConfig();
    eventName = dataRetrievedFromConfig.eventName;
  });
  let filename: string;
  let eventTime: string;

  test.each`
    testCase                                                                               | eventTime       | transactionQty | billingQty
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price"} | ${"2006/01/30"} | ${undefined}   | ${"100"}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                | ${"2005/09/30"} | ${"10"}        | ${"10"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}          | ${"2005/10/30"} | ${"10"}        | ${"12"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}           | ${"2005/11/30"} | ${"10"}        | ${"6"}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      for (let i = 0; i < data.transactionQty; i++) {
        const eventPayload = await generateTestEvent({
          event_name: eventName,
          timestamp_formatted: data.eventTime,
          timestamp: new Date(data.eventTime).getTime() / 1000,
        });
        await generateEventViaFilterLambdaAndCheckEventInS3Bucket(eventPayload);
      }
      eventTime = data.eventTime;
      const uuid = crypto.randomBytes(3).toString("hex");
      filename = `e2e-test-raw-Invoice-validFile-${uuid}`;

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

        (Contents) =>
          Contents?.filter((s3Object) =>
            s3Object.key?.includes(getYearMonth(eventTime))
          ).length === 1,
        {
          timeout: 120000,
          interval: 10000,
          notCompleteErrorMessage:
            "e2e tests invoice data never appeared in standardised folder",
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
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2005/12/28"} | ${"1"}         | ${undefined}
  `(
    "results retrieved from BillingAndTransactionsCuratedView should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      for (let i = 0; i < data.transactionQty; i++) {
        const eventPayload = await generateTestEvent({
          event_name: eventName,
          timestamp_formatted: data.eventTime,
          timestamp: new Date(data.eventTime).getTime() / 1000,
        });
        await generateEventViaFilterLambdaAndCheckEventInS3Bucket(eventPayload);
      }
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
});

export const assertQueryResultWithTestData = async (
  expectedResults: Record<string, any>,
  eventTime: string,
  vendorId: string,
  serviceName: string
): Promise<void> => {
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const response: BillingTransactionCurated[] =
    await getFilteredQueryResponse<BillingTransactionCurated>(
      tableName,
      vendorId,
      serviceName,
      eventTime
    );
  expect(response.length).toBe(1);
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

  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });
  }

  if (billingQty === undefined) {
    return {
      transactionQty,
      transactionPriceFormatted: formatCurrency(transactionPrice),
      priceDifferencePercentage: "-1234567.03", // Code for 'invoice data missing'
      billingQty: undefined,
      billingPriceFormatted: undefined,
    };
  }
  if (transactionQty === undefined) {
    return {
      billingQty,
      billingPriceFormatted: formatCurrency(billingPrice),
      priceDifferencePercentage: "-1234567.04", // Code for 'transaction data missing'
      transactionQty: undefined,
      transactionPriceFormatted: undefined,
    };
  } else {
    return {
      billingQty,
      transactionQty,
      transactionPriceFormatted: formatCurrency(transactionPrice),
      billingPriceFormatted: formatCurrency(billingPrice),
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

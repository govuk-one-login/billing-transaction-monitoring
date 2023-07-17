import {
  generateTestEvents,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  checkStandardised,
  createInvoiceWithGivenData,
  waitForRawInvoice,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { getQueryResponse } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { sendEmail } from "../../src/handlers/int-test-support/helpers/sesHelper";
import {
  getVendorServiceAndRatesFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";
import {
  createRawEmailContent,
  encodeAttachment,
  getEmailAddresses,
} from "../../src/handlers/int-test-support/helpers/emailHelper";

let eventName: string;
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

// Below tests can be run in Dev, build and staging envs but should not be run in the PR stack
beforeAll(async () => {
  dataRetrievedFromConfig = await getVendorServiceAndRatesFromConfig();
  eventName = dataRetrievedFromConfig.eventName;
});

describe("\n Email pdf invoice and verify that the BillingAndTransactionsCuratedView results match the expected data \n", () => {
  // Test cases for PDF invoices
  test.each`
    testCase                                                                               | eventTime       | transactionQty | billingQty
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price"} | ${"2006/01/30"} | ${undefined}   | ${"100"}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                | ${"2005/09/30"} | ${"10"}        | ${"10"}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      await generateTestEvents(data.eventTime, data.transactionQty, eventName);
      await emailInvoice(data, "pdf");
      await assertResults(data);
    }
  );

  test.each`
    testCase                                                                                 | eventTime       | transactionQty | billingQty
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2005/12/28"} | ${"1"}         | ${undefined}
  `(
    "results retrieved from BillingAndTransactionsCuratedView should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      await generateTestEvents(data.eventTime, data.transactionQty, eventName);
      const expectedResults = calculateExpectedResults(
        data,
        dataRetrievedFromConfig.unitPrice
      );
      await assertQueryResultWithTestData(
        expectedResults,
        data.eventTime,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName
      );
    }
  );
});

// Test cases for CSV invoices
describe("\n Email csv invoice and verify that the BillingAndTransactionsCuratedView results match the expected data \n", () => {
  test.each`
    testCase                                                                      | eventTime       | transactionQty | billingQty
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"} | ${"2005/10/30"} | ${"10"}        | ${"12"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}  | ${"2005/11/30"} | ${"10"}        | ${"6"}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match the expected values for $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      await generateTestEvents(data.eventTime, data.transactionQty, eventName);
      await emailInvoice(data, "csv");
      await assertResults(data);
    }
  );
});

export const emailInvoice = async (
  data: TestData,
  fileType: "pdf" | "csv"
): Promise<void> => {
  const { sourceEmail, toEmail } = await getEmailAddresses();
  const { invoiceData, filename } = await createInvoiceWithGivenData(
    data,
    dataRetrievedFromConfig.description,
    dataRetrievedFromConfig.unitPrice,
    dataRetrievedFromConfig.vendorId,
    dataRetrievedFromConfig.vendorName,
    fileType
  );
  const attachmentString = encodeAttachment(invoiceData, filename);
  const emailContent = createRawEmailContent(toEmail, attachmentString);

  await sendEmail({
    from: sourceEmail,
    to: toEmail,
    subject: "Invoice",
    attachments: [
      {
        raw: `Content-Type: text/plain
Content-Disposition:${emailContent}`,
      },
    ],
  });

  const isInRawInvoiceBucket = await waitForRawInvoice(
    invoiceData.vendor.id,
    filename
  );
  expect(isInRawInvoiceBucket).toBe(true);

  // Check they were standardised
  await checkStandardised(
    new Date(data.eventTime),
    dataRetrievedFromConfig.vendorId,
    {
      description: dataRetrievedFromConfig.description,
      event_name: dataRetrievedFromConfig.eventName,
    },
    dataRetrievedFromConfig.description
  );
};

interface ExpectedResults {
  billingQty: number | undefined;
  transactionQty: number | undefined;
  transactionPriceFormatted: string | undefined;
  billingPriceFormatted: number | undefined | string;
  priceDifferencePercentage: string | undefined;
}

export const assertResults = async (data: TestData): Promise<void> => {
  const expectedResults = calculateExpectedResults(
    data,
    dataRetrievedFromConfig.unitPrice
  );
  await assertQueryResultWithTestData(
    expectedResults,
    data.eventTime,
    dataRetrievedFromConfig.vendorId,
    dataRetrievedFromConfig.serviceName
  );
};

export const assertQueryResultWithTestData = async (
  expectedResults: Record<string, any>,
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

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
  getNonQuarterlyInvoiceVendorServiceAndRatesFromConfig,
  getQuarterlyInvoiceVendorServiceAndRatesFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";
import {
  encodeAttachment,
  getEmailAddresses,
} from "../../src/handlers/int-test-support/helpers/emailHelper";

let nonQuarterlyDataRetrievedFromConfig: TestDataRetrievedFromConfig;
let nonQuarterlyInvoiceEventName: string;
let quarterlyDataRetrievedFromConfig: TestDataRetrievedFromConfig | undefined;
let quarterlyInvoiceEventName: string | undefined;

// Below tests can be run in Dev, build and staging envs but should not be run in the PR stack
beforeAll(async () => {
  [nonQuarterlyDataRetrievedFromConfig, quarterlyDataRetrievedFromConfig] =
    await Promise.all([
      getNonQuarterlyInvoiceVendorServiceAndRatesFromConfig(),
      getQuarterlyInvoiceVendorServiceAndRatesFromConfig(),
    ]);

  nonQuarterlyInvoiceEventName = nonQuarterlyDataRetrievedFromConfig.eventName;
  quarterlyInvoiceEventName = quarterlyDataRetrievedFromConfig?.eventName;
});

describe("\n Email pdf invoice and verify that the BillingAndTransactionsCuratedView results match the expected data \n", () => {
  // Test cases for PDF invoices
  test.each`
    testCase                                                                               | eventTime       | invoiceDate     | transactionQty | billingQty | invoiceIsQuarterly
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price"} | ${"2006/01/30"} | ${"2006/01/30"} | ${undefined}   | ${"100"}   | ${false}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                | ${"2005/09/30"} | ${"2005/09/30"} | ${"10"}        | ${"10"}    | ${false}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      if (data.invoiceIsQuarterly && quarterlyInvoiceEventName === undefined)
        return;
      await generateTestEvents(
        data.eventTime,
        data.transactionQty,
        data.invoiceIsQuarterly
          ? (quarterlyInvoiceEventName as string)
          : nonQuarterlyInvoiceEventName
      );
      await emailInvoice(data, "pdf");
      await assertResults(data);
    }
  );

  test.each`
    testCase                                                                                                   | eventTime       | transactionQty | billingQty   | invoiceIsQuarterly
    ${"Non-quarterly and No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2005/12/28"} | ${"1"}         | ${undefined} | ${false}
    ${"Quarterly and No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"}     | ${"2005/12/28"} | ${"1"}         | ${undefined} | ${true}
  `(
    "results retrieved from BillingAndTransactionsCuratedView should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      if (data.invoiceIsQuarterly && quarterlyInvoiceEventName === undefined)
        return;
      const dataRetrievedFromConfig = getDataRetrievedFromConfig(data);
      await generateTestEvents(
        data.eventTime,
        data.transactionQty,
        dataRetrievedFromConfig.eventName
      );
      const expectedResults = calculateExpectedResults(
        data,
        dataRetrievedFromConfig.unitPrice
      );
      await assertQueryResultWithTestData(
        expectedResults,
        data.eventTime,
        dataRetrievedFromConfig.vendorId,
        dataRetrievedFromConfig.serviceName,
        data.invoiceIsQuarterly
      );
    }
  );
});

// Test cases for CSV invoices
describe("\n Email csv invoice and verify that the BillingAndTransactionsCuratedView results match the expected data \n", () => {
  test.each`
    testCase                                                                      | eventTime       | invoiceDate     | transactionQty | billingQty | invoiceIsQuarterly
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"} | ${"2005/10/30"} | ${"2005/10/30"} | ${"10"}        | ${"12"}    | ${false}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}  | ${"2005/11/30"} | ${"2005/11/30"} | ${"10"}        | ${"6"}     | ${false}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match the expected values for $testCase,$eventTime,$transactionQty,$billingQty",
    async (data) => {
      if (data.invoiceIsQuarterly && quarterlyInvoiceEventName === undefined)
        return;
      await generateTestEvents(
        data.eventTime,
        data.transactionQty,
        data.invoiceIsQuarterly
          ? (quarterlyInvoiceEventName as string)
          : nonQuarterlyInvoiceEventName
      );
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
  const dataRetrievedFromConfig = getDataRetrievedFromConfig(data);
  const { invoiceData, filename } = await createInvoiceWithGivenData(
    data,
    dataRetrievedFromConfig.description,
    dataRetrievedFromConfig.unitPrice,
    dataRetrievedFromConfig.vendorId,
    dataRetrievedFromConfig.vendorName,
    fileType
  );
  const attachmentString = encodeAttachment(invoiceData, filename);

  await sendEmail({
    SourceAddress: sourceEmail,
    DestinationAddresses: [toEmail],
    Subject: "Invoice",
    MessageBody: "Please find the attached invoice",
    Attachments: [attachmentString],
  });

  const isInRawInvoiceBucket = await waitForRawInvoice(
    invoiceData.vendor.id,
    filename
  );
  expect(isInRawInvoiceBucket).toBe(true);

  // Check they were standardised
  await checkStandardised(
    new Date(data.invoiceDate),
    dataRetrievedFromConfig.vendorId,
    {
      description: dataRetrievedFromConfig.description,
      event_name: dataRetrievedFromConfig.eventName,
    },
    dataRetrievedFromConfig.description,
    { quarterly: data.invoiceIsQuarterly }
  );
};

interface ExpectedResults {
  billingQty: number | undefined;
  transactionQty: number | undefined;
  transactionPriceFormatted: string | undefined;
  billingPriceFormatted: number | undefined | string;
  priceDifferencePercentage: string | undefined;
  invoiceIsQuarterly: string;
}

export const assertResults = async (data: TestData): Promise<void> => {
  const dataRetrievedFromConfig = getDataRetrievedFromConfig(data);
  const expectedResults = calculateExpectedResults(
    data,
    dataRetrievedFromConfig.unitPrice
  );
  await assertQueryResultWithTestData(
    expectedResults,
    data.invoiceDate ?? data.eventTime,
    dataRetrievedFromConfig.vendorId,
    dataRetrievedFromConfig.serviceName,
    data.invoiceIsQuarterly
  );
};

export const assertQueryResultWithTestData = async (
  expectedResults: Record<string, any>,
  time: string,
  vendorId: string,
  serviceName: string,
  invoiceIsQuarterly: boolean = false
): Promise<void> => {
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const response = await getQueryResponse<BillingTransactionCurated>(
    tableName,
    vendorId,
    serviceName,
    time,
    invoiceIsQuarterly
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
  expect(response[0].invoice_is_quarterly).toEqual(
    expectedResults.invoiceIsQuarterly
  );
};

const calculateExpectedResults = (
  { billingQty, invoiceIsQuarterly, transactionQty }: TestData,
  unitPrice: number
): ExpectedResults => {
  const billingPrice = unitPrice * billingQty;
  const transactionPrice = unitPrice * transactionQty;
  const priceDifference = billingPrice - transactionPrice;
  const priceDifferencePercentage = (priceDifference / transactionPrice) * 100;
  const invoiceIsQuarterlyString = invoiceIsQuarterly?.toString() ?? "false";

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
      invoiceIsQuarterly: invoiceIsQuarterlyString,
    };
  }
  if (transactionQty === undefined) {
    return {
      billingQty,
      billingPriceFormatted: formatCurrency(billingPrice),
      priceDifferencePercentage: "-1234567.04", // Code for 'transaction data missing'
      transactionQty: undefined,
      transactionPriceFormatted: undefined,
      invoiceIsQuarterly: invoiceIsQuarterlyString,
    };
  } else {
    return {
      billingQty,
      transactionQty,
      transactionPriceFormatted: formatCurrency(transactionPrice),
      billingPriceFormatted: formatCurrency(billingPrice),
      priceDifferencePercentage: priceDifferencePercentage.toFixed(1),
      invoiceIsQuarterly: invoiceIsQuarterlyString,
    };
  }
};

const getDataRetrievedFromConfig = (
  data: TestData
): TestDataRetrievedFromConfig => {
  const dataRetrievedFromConfig = data.invoiceIsQuarterly
    ? quarterlyDataRetrievedFromConfig
    : nonQuarterlyDataRetrievedFromConfig;

  if (dataRetrievedFromConfig === undefined)
    throw Error("No appropriate config data found");

  return dataRetrievedFromConfig;
};

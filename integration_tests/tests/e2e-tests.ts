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
import { sendRawEmail } from "../../src/handlers/int-test-support/helpers/sesHelper";
import {
  getEmailAddresses,
  getVendorServiceAndRatesFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";
import { InvoiceData } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/types";
import {
  Invoice,
  makeMockInvoiceCSVData,
  makeMockInvoicePdfData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/invoice";

let eventName: string;
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

// Below tests can be run both in Dev, build and staging but does not run in PR stack
beforeAll(async () => {
  dataRetrievedFromConfig = await getVendorServiceAndRatesFromConfig();
  eventName = dataRetrievedFromConfig.eventName;
});

describe("\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n", () => {
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

describe("\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n", () => {
  test.each`
    testCase                                                                      | eventTime       | transactionQty | billingQty
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"} | ${"2005/10/30"} | ${"10"}        | ${"12"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}  | ${"2005/11/30"} | ${"10"}        | ${"6"}
  `(
    "results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$transactionQty,$billingQty",
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
  const attachmentString = createAttachment(invoiceData, filename);
  const emailContent = constructRawEmailContent(toEmail, attachmentString);

  await sendRawEmail({
    Source: sourceEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    RawMessage: {
      Data: Uint8Array.from(Buffer.from(emailContent)),
    },
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

const createAttachment = (
  invoiceData: InvoiceData,
  filename: string
): string => {
  let attachment = "";
  let attachmentContentType = "";
  if (filename.endsWith(".pdf")) {
    const pdfInvoice = makeMockInvoicePdfData(new Invoice(invoiceData));
    const pdfInvoiceBuffer = Buffer.from(pdfInvoice);
    attachment = pdfInvoiceBuffer.toString("base64");
    attachmentContentType = "application/pdf";
  } else if (filename.endsWith(".csv")) {
    const csvInvoice = makeMockInvoiceCSVData(new Invoice(invoiceData));
    attachment = csvInvoice;
    attachmentContentType = "text/csv";
  }

  const attachmentString = [
    `Content-Type:${attachmentContentType}`,
    'Content-Disposition: attachment; filename="' + filename + '"',
    "Content-Transfer-Encoding: base64",
    "",
    attachment,
  ].join("\n");

  return attachmentString;
};
const constructRawEmailContent = (
  toEmail: string,
  attachmentString: string
): string => {
  const rawEmailContent = [
    `To:${toEmail}`,
    "Subject: Invoice",
    "MIME-Version 1.0",
    'Content-Type: multipart/mixed; boundary="boundary"',
    "",
    "--boundary",
    "Content-Type:text/plain",
    "",
    "Please find the attached invoice.",
    "--boundary",
    attachmentString,
    "--boundary--",
  ].join("\n");

  return rawEmailContent;
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

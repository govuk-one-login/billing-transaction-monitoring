import {
  generateTestEvents,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkStandardised,
  createInvoiceWithGivenData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { getQueryResponse } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  BucketAndPrefix,
  checkS3BucketForGivenStringExists,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { sendEmail } from "../../src/handlers/int-test-support/helpers/sesHelper";

import {
  getVendorServiceAndRatesAndE2ETestEmailFromConfig,
  TestData,
  TestDataRetrievedFromConfig,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { BillingTransactionCurated } from "./billing-and-transaction-view-tests";

let eventName: string;
let dataRetrievedFromConfig: TestDataRetrievedFromConfig;

// Below tests can be run both in Dev, build and staging but does not run in PR stack
beforeAll(async () => {
  dataRetrievedFromConfig =
    await getVendorServiceAndRatesAndE2ETestEmailFromConfig();
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

export const emailInvoice = async (
  data: TestData,
  fileType: "pdf" | "csv"
): Promise<void> => {
  const { invoiceData: attachmentContent, filename: attachmentFilename } =
    await createInvoiceWithGivenData(
      data,
      dataRetrievedFromConfig.description,
      dataRetrievedFromConfig.unitPrice,
      dataRetrievedFromConfig.vendorId,
      dataRetrievedFromConfig.vendorName,
      fileType
    );
  const prefix = resourcePrefix();
  const extractedEnvValue = prefix.split("-").pop();
  let sourceEmail: string = "";
  let toEmail: string = "";

  if (extractedEnvValue === undefined) {
    throw new Error("Env is undefined");
  }
  if (
    extractedEnvValue.includes("dev") ||
    extractedEnvValue.includes("build")
  ) {
    sourceEmail = `no-reply@btm.${extractedEnvValue}.account.gov.uk`;
    toEmail = `vendor1_invoices@btm.${extractedEnvValue}.account.gov.uk`;
  } else if (
    extractedEnvValue?.includes("staging") ||
    extractedEnvValue?.includes("integration")
  ) {
    sourceEmail = `no-reply@btm.${extractedEnvValue}.account.gov.uk`;
    toEmail = dataRetrievedFromConfig.toEmailId;
    console.log("EmailId from config:", toEmail);
  } else {
    console.error(`Email domains are not exists for the given ${prefix}`);
  }

  console.log("SourceEmail:", sourceEmail);
  console.log("ToEmail:", toEmail);

  const testTime = new Date();
  const messageId = await sendEmail({
    Source: sourceEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: "Invoice",
      },
      Body: {
        Text: {
          Data: "Please find the attached invoice",
        },
      },
      Attachment: {
        Filename: attachmentFilename,
        Content: JSON.stringify(attachmentContent),
        ContentType: `application/${fileType}`,
      },
    },
  });

  const stringToCheckInEmailContents = `Message-ID: <${messageId}`;
  const s3Params: BucketAndPrefix = {
    bucketName: `${prefix}-email`,
    prefix: dataRetrievedFromConfig.vendorId,
  };
  const givenStringExists = await checkS3BucketForGivenStringExists(
    stringToCheckInEmailContents,
    30000,
    s3Params,
    testTime
  );
  expect(givenStringExists).toBe(true);

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

interface ExpectedResults {
  billingQty: number | undefined;
  transactionQty: number | undefined;
  transactionPriceFormatted: string | undefined;
  billingPriceFormatted: number | undefined | string;
  priceDifferencePercentage: string | undefined;
}

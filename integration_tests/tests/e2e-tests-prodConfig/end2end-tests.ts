import {
  deleteS3Objects,
  getS3Object,
  listS3Objects,
} from "../../../src/handlers/int-test-support/helpers/s3Helper";
import csvtojson from "csvtojson";
import {
  configStackName,
  resourcePrefix,
} from "../../../src/handlers/int-test-support/helpers/envHelper";
import path from "path";
import fs from "fs";
import {
  generateRandomId,
  poll,
  TableNames,
} from "../../../src/handlers/int-test-support/helpers/commonHelpers";
import { VendorServiceConfigRow } from "../../../src/shared/utils/config-utils/fetch-vendor-service-config";
import { invokeLambda } from "../../../src/handlers/int-test-support/helpers/lambdaHelper";
import {
  randomInvoice,
  randomLineItem,
} from "../../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import {
  queryObject,
  startQueryExecutionCommand,
} from "../../../src/handlers/int-test-support/helpers/athenaHelper";

let vendorServiceDetails: VendorServiceConfigRow[] = [];
const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

const convertVendorServiceCSVtoJson = async (): Promise<
  VendorServiceConfigRow[]
> => {
  const configBucket = configStackName();

  const vendorServiceCSV = await getS3Object({
    bucket: configBucket,
    key: "vendor_services/vendor-services.csv",
  });
  vendorServiceDetails = await csvtojson().fromString(vendorServiceCSV ?? "");
  return vendorServiceDetails;
};

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
    vendorServiceDetails = await convertVendorServiceCSVtoJson();
  });
  test.each`
    testCase                                                                              | eventTime       | unitPrice | transactionQty | billingQty | transactionPrice | billingPrice | priceDiff    | qtyDiff  | priceDifferencePercent | qtyDifferencePercent
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty BillingPrice"} | ${"2022/10/30"} | ${"0.34"} | ${undefined}   | ${"100"}   | ${undefined}     | ${"34.0000"} | ${"34.0000"} | ${"100"} | ${undefined}           | ${undefined}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}               | ${"2022/11/30"} | ${"0.34"} | ${"10"}        | ${"10"}    | ${"3.4000"}      | ${"3.4000"}  | ${"0.0000"}  | ${"0"}   | ${"0.0000"}            | ${"0"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}         | ${"2022/12/01"} | ${"0.34"} | ${"20"}        | ${"21"}    | ${"6.8000"}      | ${"7.1400"}  | ${"0.3400"}  | ${"1"}   | ${"5.0000"}            | ${"5"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}          | ${"2023/01/01"} | ${"0.34"} | ${"10"}        | ${"5"}     | ${"3.4000"}      | ${"1.7000"}  | ${"-1.7000"} | ${"-5"}  | ${"-50.0000"}          | ${"-50"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      await generateTransactionEvents(data);
      await createInvoice(data);
      await assertResultsWithTestData(data);
    }
  );
});

describe("\n no invoice uploaded to raw invoice bucket and verify billing and transaction_curated view query results matches with expected data\n", () => {
  beforeAll(async () => {
    vendorServiceDetails = await convertVendorServiceCSVtoJson();
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2023-02-28",
    });
  });
  test.each`
    testCase                                                                                 | eventTime       | transactionQty | billingQty   | transactionPrice | billingPrice | priceDiff    | qtyDiff | priceDifferencePercent | qtyDifferencePercent
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2023/02/28"} | ${"1"}         | ${undefined} | ${"0.3400"}      | ${undefined} | ${"-0.3400"} | ${"-1"} | ${"-100.0000"}         | ${"-100"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      await generateTransactionEvents(data);
      await assertResultsWithTestData(data);
    }
  );
});

const generateTransactionEvents = async ({
  eventTime,
  transactionQty,
}: TestData): Promise<void> => {
  for (let i = 0; i < transactionQty; i++) {
    const updatedSQSEventPayload = await updateSQSEventPayloadBody(eventTime);
    const functionName = `${resourcePrefix()}-filter-function`;
    await invokeLambda(functionName, updatedSQSEventPayload);
  }
};

const updateSQSEventPayloadBody = async (
  eventTime: string
): Promise<string> => {
  const eventPayload = {
    component_id: "Test_COMP",
    event_id: `e2eTestEvents_${generateRandomId()}`,
    timestamp: new Date(eventTime).getTime() / 1000,
    event_name: vendorServiceDetails[0].event_name,
    timestamp_formatted: eventTime,
  };

  // update SQS Event body value with eventPayload
  const sqsEventFilePath = path.join(
    __dirname,
    "../../payloads/validSQSEventPayload.json"
  );
  const sqsEventPayloadFileContent = fs.readFileSync(sqsEventFilePath, "utf-8");
  const sqsEventPayload = JSON.parse(sqsEventPayloadFileContent);
  sqsEventPayload.Records[0].body = JSON.stringify(eventPayload);
  const updatedSQSEventPayload = JSON.stringify(sqsEventPayload);
  return updatedSQSEventPayload;
};

export const createInvoice = async ({
  eventTime,
  unitPrice,
  billingQty,
}: TestData): Promise<void> => {
  const givenBillingQty = billingQty;

  const response = await getS3Object({
    bucket: configStackName(),
    key: "e2e-test.json",
  });

  const getServiceDescription = JSON.parse(response ?? "");

  const lineItems = randomLineItem({
    description: getServiceDescription.parser_0_service_description,
    quantity: givenBillingQty,
    unitPrice,
  });

  const givenInvoice = randomInvoice({
    vendor: {
      id: vendorServiceDetails[0].vendor_id,
      name: vendorServiceDetails[0].vendor_name,
    },
    date: new Date(eventTime),
    lineItems: [lineItems],
  });

  const filename = `raw-Invoice-${Math.random()
    .toString(36)
    .substring(2, 7)}-validFile.pdf`;

  const invoiceCreationTime = new Date();

  await createInvoiceInS3({ invoiceData: givenInvoice, filename });

  await poll(
    async () =>
      await listS3Objects({
        bucketName,
        prefix: "btm_billing_standardised",
      }),
    ({ Contents }) =>
      !!Contents?.some(
        (s3Object) =>
          s3Object.LastModified !== undefined &&
          new Date(s3Object.LastModified) >= invoiceCreationTime
      ),
    {
      timeout: 60000,
      nonCompleteErrorMessage:
        "Invoice data never appeared in standardised folder",
    }
  );
};

const assertResultsWithTestData = async ({
  eventTime,
  priceDiff,
  qtyDiff,
  priceDifferencePercent,
  qtyDifferencePercent,
  billingPrice,
  billingQty,
  transactionPrice,
  transactionQty,
}: TestData): Promise<void> => {
  const databaseName = `${prefix}-calculations`;
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const year = new Date(eventTime).getFullYear();
  const month = new Date(eventTime).toLocaleString("en-US", {
    month: "2-digit",
  });
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const curatedQueryString = `SELECT * FROM "${tableName}" WHERE vendor_id='${vendorServiceDetails[0].vendor_id}' AND service_name='${vendorServiceDetails[0].service_name}' AND year='${year}' AND month='${month}'`;
  const queryId = await startQueryExecutionCommand({
    databaseName,
    queryString: curatedQueryString,
  });
  const response = await queryObject(queryId);
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

interface TestData {
  eventTime: string;
  unitPrice: number;
  transactionQty: number;
  billingQty: number;
  billingPrice: string;
  transactionPrice: string;
  priceDiff: string;
  qtyDiff: string;
  priceDifferencePercent: string;
  qtyDifferencePercent: string;
}

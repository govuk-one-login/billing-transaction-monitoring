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

let retrieveVendorServiceDetails: VendorServiceConfigRow[] = [];
const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

const convertVendorServiceCSVtoJson = async (): Promise<
  VendorServiceConfigRow[]
> => {
  const configBucket = configStackName();
  console.log(configBucket);

  const vendorServiceCSV = await getS3Object({
    bucket: configBucket,
    key: "vendor_services/vendor-services.csv",
  });
  retrieveVendorServiceDetails = await csvtojson().fromString(
    vendorServiceCSV ?? ""
  );
  return retrieveVendorServiceDetails;
};

describe("\n generate events\n", () => {
  beforeAll(async () => {
    await deleteS3Objects({ bucketName, prefix: "btm_billing_standardised" });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2023-01-01",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2023-02-01",
    });
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2022-12-01",
    });
    retrieveVendorServiceDetails = await convertVendorServiceCSVtoJson();
  });
  test.each`
    testCase                                                                              | eventTime       | unitPrice | transactionQty | billingQty | transactionPrice | billingPrice | priceDiff    | qtyDiff | priceDifferencePercent | qtyDifferencePercent
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty BillingPrice"} | ${"2022/11/30"} | ${"3.33"} | ${undefined}   | ${"2"}     | ${undefined}     | ${"6.6600"}  | ${"6.6600"}  | ${"2"}  | ${undefined}           | ${undefined}
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}               | ${"2022/12/01"} | ${"3.33"} | ${"2"}         | ${"2"}     | ${"6.6600"}      | ${"6.6600"}  | ${"0.0000"}  | ${"0"}  | ${"0.0000"}            | ${"0"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}         | ${"2023/01/01"} | ${"3.33"} | ${"1"}         | ${"2"}     | ${"3.3300"}      | ${"6.6600"}  | ${"3.3300"}  | ${"1"}  | ${"100.0000"}          | ${"100"}
    ${"BillingQty BillingPrice lesser than TransactionQty and TransactionPrice"}          | ${"2023/02/01"} | ${"3.33"} | ${"2"}         | ${"1"}     | ${"6.6600"}      | ${"3.3300"}  | ${"-3.3300"} | ${"-1"} | ${"-50.0000"}          | ${"-50"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      await generateTransactionEvent(data);
      await createInvoice(data);
      await assertResultsWithTestData(data);
    }
  );
});

describe("\n no invoice uploaded to raw invoice bucket and verify billing and transaction_curated view query results matches with expected data\n", () => {
  beforeAll(async () => {
    retrieveVendorServiceDetails = await convertVendorServiceCSVtoJson();
    await deleteS3Objects({
      bucketName,
      prefix: "btm_transactions/2023-03-01",
    });
  });
  test.each`
    testCase                                                                                 | eventTime       | transactionQty | billingQty   | transactionPrice | billingPrice | priceDiff    | qtyDiff | priceDifferencePercent | qtyDifferencePercent
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"2023/03/01"} | ${"1"}         | ${undefined} | ${"3.3300"}      | ${undefined} | ${"-3.3300"} | ${"-1"} | ${"-100.0000"}         | ${"-100"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$eventTime,$unitPrice,$transactionQty,$billingQty,$transactionPrice,$billingPrice,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent",
    async (data) => {
      await generateTransactionEvent(data);
      await assertResultsWithTestData(data);
    }
  );
});

const filePath = path.join(
  __dirname,
  "../../payloads/filterFunctionPayload.json"
);

const generateTransactionEvent = async ({
  eventTime,
  transactionQty,
}: TestData): Promise<void> => {
  for (let i = 0; i < transactionQty; i++) {
    const updatedPayload = await updateFilterFunctionPayloadBody(eventTime);
    await invokeLambda(updatedPayload);
  }
};

const updateFilterFunctionPayloadBody = async (
  eventTime: string
): Promise<string> => {
  // convert eventPayload to json

  const eventPayload = {
    component_id: "Test_COMP",
    event_id: `intTestEvents_${generateRandomId()}`,
    timestamp: new Date(eventTime).getTime() / 1000,
    event_name: retrieveVendorServiceDetails[0].event_name,
    timestamp_formatted: eventTime,
  };

  // update body value with eventPayload and eventSourceARN value
  const filterFunctionPayload = fs.readFileSync(filePath, "utf-8");
  const filterFunctionPayloadJSON = JSON.parse(filterFunctionPayload);
  filterFunctionPayloadJSON.Records[0].body = JSON.stringify(eventPayload);
  const eventSource = `${resourcePrefix()}-filter-queue`;
  filterFunctionPayloadJSON.Records[0].eventSourceARN = eventSource;

  // escape  characters in json and write the updated upload to payload.json file
  const updatedFilterFunctionPayload = JSON.stringify(
    filterFunctionPayloadJSON
  );
  return updatedFilterFunctionPayload;
};

export const createInvoice = async ({
  eventTime,
  unitPrice,
  billingQty,
}: TestData): Promise<void> => {
  const givenBillingQty = billingQty;

  const lineItems = randomLineItem({
    description: retrieveVendorServiceDetails[0].service_name,
    quantity: givenBillingQty,
    unitPrice,
  });

  const givenInvoice = randomInvoice({
    vendor: {
      id: retrieveVendorServiceDetails[0].vendor_id,
      name: retrieveVendorServiceDetails[0].vendor_name,
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
      timeout: 59000,
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
  const curatedQueryString = `SELECT * FROM "${tableName}" WHERE vendor_id='${retrieveVendorServiceDetails[0].vendor_id}' AND service_name='${retrieveVendorServiceDetails[0].service_name}' AND year='${year}' AND month='${month}'`;
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

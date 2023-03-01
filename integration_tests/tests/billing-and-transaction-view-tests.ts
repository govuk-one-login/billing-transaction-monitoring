import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  deleteS3Events,
  eventTimeStamp,
  generatePublishAndValidateEvents,
  poll,
  TableNames,
  TimeStamps,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  deleteS3Objects,
  putS3Object,
  S3Object,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import path from "path";
import fs from "fs";
import {
  EventName,
  VendorId,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYear } from "../../src/handlers/int-test-support/helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nUpload invoice to standardised folder and verify billing and transaction_curated view query results matches with expected data \n", () => {
  const folderPrefix = "btm_billing_standardised";
  const testObject: S3Object = {
    bucket: `${prefix}-storage`,
    key: `${folderPrefix}/receipt.txt`,
  };
  beforeAll(async () => {
    // tests are enabled to run sequentially as we are deleting the S3 directory in view tests so when running the test
    // in parallel other tests will be interrupted(e.g. sns-s3 tests generate and checks eventId). We can enable to run in parallel
    // once we implement BTM-340 to clean up after each test
    await deleteS3Objects({ bucketName, prefix: "btm_transactions" });
    // uploading file to s3 will be removed once BTM-276 changes merged
    const file = "../payloads/receipt.txt";
    const filePath = path.join(__dirname, file);
    const fileData = fs.readFileSync(filePath);
    await putS3Object({ data: fileData, target: testObject });
    await poll(
      async () => await listS3Objects({ bucketName, prefix: testObject.key }),
      (results) => Boolean(results.Contents?.length)
    );
  });

  test.each`
    testCase                                                                                 | eventName             | vendorId                | eventTime                         | numberOfTestEvents | priceDiff     | qtyDiff | priceDifferencePercent | qtyDifferencePercent | billingPrice | billingQty | transactionPrice | transactionQty
    ${"BillingQty BillingPrice equals TransactionQty and TransactionPrice"}                  | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${TimeStamps.CURRENT_TIME}        | ${"2"}             | ${"0.0000"}   | ${"0"}  | ${"0.0000"}            | ${"0"}               | ${"6.6600"}  | ${"2"}     | ${"6.6600"}      | ${"2"}
    ${"BillingQty BillingPrice greater than TransactionQty and TransactionPrice"}            | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${TimeStamps.CURRENT_TIME}        | ${"1"}             | ${"3.3300"}   | ${"1"}  | ${"100.0000"}          | ${"100"}             | ${"6.6600"}  | ${"2"}     | ${"3.3300"}      | ${"1"}
    ${"BillingQty BillingPrice less than TransactionQty and TransactionPrice"}               | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${TimeStamps.CURRENT_TIME}        | ${"3"}             | ${"-3.3300"}  | ${"-1"} | ${"-33.3333"}          | ${"-33"}             | ${"6.6600"}  | ${"2"}     | ${"9.9900"}      | ${"3"}
    ${"No TransactionQty No TransactionPrice(no events) but has BillingQty BillingPrice"}    | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${TimeStamps.CURRENT_TIME}        | ${undefined}       | ${"6.6600"}   | ${"2"}  | ${undefined}           | ${undefined}         | ${"6.6600"}  | ${"2"}     | ${undefined}     | ${undefined}
    ${"BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice "}   | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${TimeStamps.CURRENT_TIME}        | ${11}              | ${"-27.5000"} | ${"-9"} | ${"-100.0000"}         | ${"-81"}             | ${"0.0000"}  | ${"2"}     | ${"27.5000"}     | ${"11"}
    ${"BillingQty equals TransactionQty and No TransactionPrice No BillingPrice "}           | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${TimeStamps.CURRENT_TIME}        | ${2}               | ${"0.0000"}   | ${"0"}  | ${"0.0000"}            | ${"0"}               | ${"0.0000"}  | ${"2"}     | ${"0.0000"}      | ${"2"}
    ${"BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice"} | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${TimeStamps.THIS_TIME_LAST_YEAR} | ${2}               | ${"27.5000"}  | ${"9"}  | ${undefined}           | ${"450"}             | ${"27.5000"} | ${"11"}    | ${"0.0000"}      | ${"2"}
    ${"BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice"}     | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${TimeStamps.THIS_TIME_LAST_YEAR} | ${2}               | ${"4.2000"}   | ${"0"}  | ${"170.7317"}          | ${"0"}               | ${"6.6600"}  | ${"2"}     | ${"2.4600"}      | ${"2"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQty,$billingPrice,$transactionQty,$transactionPrice,$qtyDiff,$priceDiff,$qtyDifferencePercent,$priceDifferencePercent",
    async (data) => {
      await assertResultsWithTestData(data);
    }
  );
});

describe("\n no invoice uploaded to standardised folder and verify billing and transaction_curated view query results matches with expected data    \n", () => {
  beforeAll(async () => {
    await deleteS3Objects({ bucketName, prefix: "btm_billing_standardised" });
    await deleteS3Objects({ bucketName, prefix: "btm_transactions" });
  });
  test.each`
    testCase                                                                                 | eventName             | vendorId                | eventTime                  | numberOfTestEvents | priceDiff    | qtyDiff | priceDifferencePercent | qtyDifferencePercent | billingPrice | billingQty   | transactionPrice | transactionQty
    ${"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice"} | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${TimeStamps.CURRENT_TIME} | ${"1"}             | ${"-3.3300"} | ${"-1"} | ${"-100.0000"}         | ${"-100"}            | ${undefined} | ${undefined} | ${"3.3300"}      | ${"1"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQuantity,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent,$billingPrice",
    async (data) => {
      await assertResultsWithTestData(data);
    }
  );
});

interface TestData {
  eventName: EventName;
  vendorId: VendorId;
  eventTime: TimeStamps;
  numberOfTestEvents: number;
  priceDiff: string;
  qtyDiff: string;
  priceDifferencePercent: string;
  qtyDifferencePercent: string;
  billingPrice: string;
  billingQty: string;
  transactionPrice: string;
  transactionQty: string;
}

export const assertResultsWithTestData = async ({
  eventName,
  vendorId,
  eventTime,
  numberOfTestEvents,
  priceDiff,
  qtyDiff,
  priceDifferencePercent,
  qtyDifferencePercent,
  billingPrice,
  billingQty,
  transactionPrice,
  transactionQty,
}: TestData): Promise<void> => {
  const eventIds = await generatePublishAndValidateEvents({
    numberOfTestEvents,
    eventName,
    eventTime,
  });
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const year = new Date(eventTimeStamp[eventTime] * 1000).getFullYear();
  const response: BillingTransactionCurated =
    await queryResponseFilterByVendorServiceNameYear({
      vendorId,
      eventName,
      tableName,
      year,
    });
  await deleteS3Events(eventIds, eventTime);
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

type BillingTransactionCurated = Array<{
  vendor_name: string;
  service_name: string;
  year: string;
  month: string;
  price_difference: number;
  quantity_difference: number;
  price_difference_percentage: number;
  quantity_difference_percentage: number;
  billing_price: number;
  billing_quantity: number;
  transaction_price: number;
  transaction_quantity: number;
}>;

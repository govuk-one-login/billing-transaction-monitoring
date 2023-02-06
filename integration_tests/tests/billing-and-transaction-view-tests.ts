import { configStackName, resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  deleteS3Events,
  eventTimeStamp,
  generatePublishAndValidateEvents,
  TableNames,
  TimeStamps,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  deleteS3Objects,
  putS3Object,
  checkIfS3ObjectExists,
  S3Object,
  checkS3BucketNotEmpty,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import path from "path";
import fs from "fs";
import {
  EventName,
  ClientId,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYear } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { getMatchingVendorServiceConfigRows } from "../../src/shared/utils";
import { randomInvoice, randomLineItem } from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nUpload invoice to standardised folder and verify billing and transaction_curated view query results matches with expected data \n", () => {

  beforeAll(async () => {
    // tests are enabled to run sequentially as we are deleting the S3 directory in view tests so when running the test
    // in parallel other tests will be interrupted(e.g. sns-s3 tests generate and checks eventId). We can enable to run in parallel
    // once we implement BTM-340 to clean up after each test
    await deleteS3Objects({ bucketName, prefix: "btm_transactions" });
    await deleteS3Objects({ bucketName, prefix: "btm_billing_standardised" });
  });

  test.each`
    testCase                                                                                 | eventName             | clientId                        | eventTime                         | numberOfTestEvents | unitPrice     | priceDiff    | qtyDiff | priceDifferencePercent | qtyDifferencePercent| billingPrice | billingQty | transactionPrice | transactionQty
   
  
    ${"BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice "}   | ${EventName.EVENT_1}  | ${ClientId.vendor_testvendor4}  | ${TimeStamps.CURRENT_TIME}        | ${11}              |  ${"0.00"}    |${"-27.5000"} | ${"-9"} | ${"-100.0000"}         | ${"-81"}             | ${"0.0000"}  | ${"2"}     | ${"27.5000"}     | ${"11"}
    ${"BillingQty equals TransactionQty and No TransactionPrice No BillingPrice "}           | ${EventName.EVENT_1}  | ${ClientId.vendor_testvendor4}  | ${TimeStamps.CURRENT_TIME}        | ${2}               |  ${"0.00"}    |${"0.0000"}   | ${"0"}  | ${"0.0000"}            | ${"0"}               | ${"0.0000"}  | ${"2"}     | ${"0.0000"}      | ${"2"}
    ${"BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice"} | ${EventName.EVENT_1}  | ${ClientId.vendor_testvendor4}  | ${TimeStamps.THIS_TIME_LAST_YEAR} | ${2}               |  ${"8.88"}    |${"27.5000"}  | ${"9"}  | ${undefined}           | ${"450"}             | ${"27.5000"} | ${"11"}    | ${"0.0000"}      | ${"2"}
    ${"BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice"}     | ${EventName.EVENT_1}  | ${ClientId.vendor_testvendor1}  | ${TimeStamps.THIS_TIME_LAST_YEAR} | ${2}               |  ${"1.23"}    |${"4.2000"}   | ${"0"}  | ${"170.7317"}          | ${"0"}               | ${"6.6600"}  | ${"2"}     | ${"2.4600"}      | ${"2"}
    `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQty,$priceDiff,$qtyDiff,$priceDifferencePercent,$qtyDifferencePercent,$billingPrice",
    async (data) => {
      await assertResultsWithTestData(data);
    }
  );
});



interface TestData {
  eventName: EventName;
  clientId: ClientId;
  eventTime: TimeStamps;
  numberOfTestEvents: number;
  unitPrice:number
  priceDiff: string;
  qtyDiff: string;
  priceDifferencePercent: string;
  qtyDifferencePercent: string;
  billingPrice: string;
  billingQty: number;
  transactionPrice: string;
  transactionQty: string;
}

export const assertResultsWithTestData = async ({
  eventName,
  clientId,
  eventTime,
  numberOfTestEvents,
  unitPrice,
  priceDiff,
  qtyDiff,
  priceDifferencePercent,
  qtyDifferencePercent,
  billingPrice,
  billingQty,
  transactionPrice,
  transactionQty,
}: TestData): Promise<void> => {

  const givenClientId = clientId;
  const givenEventName = eventName;
  const givenQuantity = billingQty;
 const vendorServiceConfigRow=await getMatchingVendorServiceConfigRows(
     configStackName(),
     { event_name:givenEventName,client_id:givenClientId}
   );

  const givenLineItem = randomLineItem({
     description: "Passport check and verification",
     quantity: givenQuantity,
     unitPrice
  });


 console.log(vendorServiceConfigRow)
  const givenInvoice = randomInvoice({
    vendor: {
      name: vendorServiceConfigRow[0].vendor_name,
    },
   lineItems: [givenLineItem],
  });
 
  console.log(givenInvoice)
 
  const [eventIds] = await Promise.all([
    generatePublishAndValidateEvents({
      numberOfTestEvents,
      eventName,
      clientId,
      eventTime: TimeStamps.CURRENT_TIME,
    }),
    createInvoiceInS3(givenInvoice) ]);
    const checkFileExistsInStandardisedFolder = await checkS3BucketNotEmpty({bucketName,prefix:"btm_billing_standardised"},30000);
   expect(checkFileExistsInStandardisedFolder).toBe(true);

  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const year = new Date(eventTimeStamp[eventTime] * 1000).getFullYear();
  const response: BillingTransactionCurated =
    await queryResponseFilterByVendorServiceNameYear({
      clientId,
      eventName,
      tableName,
      year,
    });
   await deleteS3Events(eventIds, eventTime);
  console.log(response)
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

import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";

import {
  createInvoiceInS3,
  createInvoiceWithGivenData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

import {
  generateTransactionEventsViaFilterLambda,
  TestData,
} from "../../src/handlers/int-test-support/testDataHelper";
import {
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  deleteS3Events,
  poll,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  deleteS3Object,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;
const standardisedFolderPrefix = "btm_billing_standardised";
let filename: string;
let eventIds: string[];
let eventTime: string;

describe("\nUpload invoice to raw invoice bucket and verify billing and transaction_curated view query results matches with expected data \n", () => {
  test.each`
    testCase                                                                                 | eventName             | vendorId                | eventTime             | unitPrice | numberOfTestEvents | priceDiff     | qtyDiff | priceDifferencePercent | qtyDifferencePercent | billingPrice | billingQty | transactionPrice | transactionQty
    ${"BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice "}   | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/02/28 10:00"} | ${"0.00"} | ${11}              | ${"-27.5000"} | ${"-9"} | ${"-100.0000"}         | ${"-81"}             | ${"0.0000"}  | ${"2"}     | ${"27.5000"}     | ${"11"}
    ${"BillingQty equals TransactionQty and No TransactionPrice No BillingPrice "}           | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/03/30 10:00"} | ${"0.00"} | ${2}               | ${"0.0000"}   | ${"0"}  | ${"0.0000"}            | ${"0"}               | ${"0.0000"}  | ${"2"}     | ${"0.0000"}      | ${"2"}
    ${"BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice"} | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/04/30 10:00"} | ${"2.50"} | ${2}               | ${"27.5000"}  | ${"9"}  | ${undefined}           | ${"450"}             | ${"27.5000"} | ${"11"}    | ${"0.0000"}      | ${"2"}
    ${"BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice"}     | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${"2022/05/30 10:00"} | ${"3.33"} | ${2}               | ${"4.2000"}   | ${"0"}  | ${"170.7317"}          | ${"0"}               | ${"6.6600"}  | ${"2"}     | ${"2.4600"}      | ${"2"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQty,$billingPrice,$transactionQty,$transactionPrice,$qtyDiff,$priceDiff,$qtyDifferencePercent,$priceDifferencePercent",
    async ({ ...data }) => {
      eventTime = data.eventTime;
      eventIds = await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        data.eventName
      );
      filename = `raw-Invoice-${Math.random()
        .toString(36)
        .substring(2, 7)}-validFile.pdf`;

      const invoiceData = createInvoiceWithGivenData(
        data,
        "Passport Check",
        data.unitPrice,
        data.vendorId,
        data.vendorName
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
              s3Object.Key === `btm_billing_standardised/${filename}.txt`
          ),
        {
          timeout: 60000,
          nonCompleteErrorMessage:
            "Invoice data never appeared in standardised folder",
        }
      );

      const eventName: EventName = data.eventName;
      const prettyEventName = prettyEventNameMap[eventName];

      await assertQueryResultWithTestData(
        data,
        data.eventTime,
        data.vendorId,
        prettyEventName
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
  {
    billingQty,
    transactionQty,
    priceDiff,
    qtyDiff,
    priceDifferencePercent,
    qtyDifferencePercent,
    billingPrice,
    transactionPrice,
  }: TestData,
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

export type BillingTransactionCurated = Array<{
  vendor_id: string;
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

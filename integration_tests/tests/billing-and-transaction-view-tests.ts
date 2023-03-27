import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import crypto from "crypto";

import {
  createInvoiceInS3,
  createInvoiceWithGivenData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

import {
  generateTransactionEventsViaFilterLambda,
  TestData,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import {
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  poll,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;
const standardisedFolderPrefix = "btm_billing_standardised";
let filename: string;

describe("\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n", () => {
  test.each`
    testCase                                                                                 | eventName             | vendorId                | eventTime             | unitPrice | numberOfTestEvents | priceDifferencePercentage | billingPriceFormatted | billingQty | transactionPriceFormatted | transactionQty
    ${"BillingQty equals TransactionQty and No TransactionPrice No BillingPrice "}           | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/03/30 10:00"} | ${"0.00"} | ${2}               | ${"-1234567.01"}          | ${"£0.00"}            | ${"2"}     | ${"£0.00"}                | ${"2"}
    ${"BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice "}   | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/02/28 10:00"} | ${"0.00"} | ${11}              | ${"-100.0"}               | ${"£0.00"}            | ${"2"}     | ${"£27.50"}               | ${"11"}
    ${"BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice"} | ${"VENDOR_4_EVENT_5"} | ${"vendor_testvendor4"} | ${"2022/04/30 10:00"} | ${"2.50"} | ${2}               | ${undefined}              | ${"£27.50"}           | ${"11"}    | ${"£0.00"}                | ${"2"}
    ${"BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice"}     | ${"VENDOR_1_EVENT_1"} | ${"vendor_testvendor1"} | ${"2022/05/30 10:00"} | ${"3.33"} | ${2}               | ${"170.7317"}             | ${"£6.66"}            | ${"2"}     | ${"£2.46"}                | ${"2"}
  `(
    "results retrieved from billing and transaction_curated view query should match with expected $testCase,$billingQty,$billingPriceFormatted,$transactionQty,$transactionPriceFormatted,$priceDifferencePercentage",
    async ({ ...data }) => {
      await generateTransactionEventsViaFilterLambda(
        data.eventTime,
        data.transactionQty,
        data.eventName
      );
      const uuid = crypto.randomBytes(3).toString("hex");
      filename = `raw-Invoice-validFile-${uuid}`;

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
              s3Object.Key === `${standardisedFolderPrefix}/${filename}.txt`
          ),
        {
          timeout: 80000,
          interval: 10000,
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
});

export const assertQueryResultWithTestData = async (
  {
    billingPriceFormatted,
    transactionPriceFormatted,
    priceDifferencePercentage,
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
  expect(response.length).toBe(1);
  expect(response[0].billing_price_formatted).toEqual(billingPriceFormatted);
  expect(response[0].transaction_price_formatted).toEqual(
    transactionPriceFormatted
  );
  expect(response[0].price_difference_percentage).toEqual(
    priceDifferencePercentage
  );
};

export type BillingTransactionCurated = Array<{
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  year: string;
  month: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference_percentage: string;
}>;

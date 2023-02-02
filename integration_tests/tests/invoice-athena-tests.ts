import {
  BillingStandardised,
  checkIfS3ObjectExists,
  deleteS3Objects,
  getS3ObjectsAsArray,
  listS3Objects,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  queryObject,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";

import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { randomInvoice } from "../../src/handlers/int-test-support/helpers/mock-data/invoice";

const prefix = resourcePrefix();
const invoice = randomInvoice();

describe("\nExecute athena query to retrieve invoice data and validate that it matches invoice files in storage s3 bucket\n", () => {
  const folderPrefix = "btm_billing_standardised";
  const bucket = `${prefix}-storage`
  const databaseName = `${prefix}-calculations`;

  const checkS3FolderNotEmpty = async (): Promise<boolean> => {
    const result = await listS3Objects({
      bucketName: bucket,
      prefix: folderPrefix,
    });
    if (result.Contents === undefined || result.Contents.length === 0) {
      console.log("S3 Folder is empty")
      return false;
    } else {
      return true;
    }
  };

  beforeAll(async () => {
    await deleteS3Objects({
      bucketName: bucket,
      prefix: folderPrefix,
    });

    await createInvoiceInS3(invoice);
    const checkFileExistsInStandardisedFolder = await waitForTrue(
      checkS3FolderNotEmpty,
      1000,
      25000
    );
    expect(checkFileExistsInStandardisedFolder).toBe(true);
  });

  test("retrieved invoice details should match invoice data in s3 bucket", async () => {
    const queryString = `SELECT * FROM "btm_billing_standardised" where invoice_receipt_id='${invoice.invoiceNumber}'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObj = await queryObject(queryId);
    const athenaQueryValues: BillingStandardised[] = Object.values(queryObj);
    const s3InvoiceValues = await getS3ObjectsAsArray(
      bucket,
      folderPrefix
    );

    for (let i = 0; i < s3InvoiceValues.length; i++) {
      expect(s3InvoiceValues[i].invoice_receipt_id).toEqual(
        athenaQueryValues[i].invoice_receipt_id
      );
      expect(s3InvoiceValues[i].vendor_name).toEqual(
        athenaQueryValues[i].vendor_name
      );
      expect(s3InvoiceValues[i].total.toFixed(4)).toEqual(
        athenaQueryValues[i].total
      );
      expect(s3InvoiceValues[i].invoice_receipt_date).toEqual(
        athenaQueryValues[i].invoice_receipt_date
      );
      expect(s3InvoiceValues[i].subtotal.toFixed(4)).toEqual(
        athenaQueryValues[i].subtotal
      );
      expect(s3InvoiceValues[i].due_date).toEqual(
        athenaQueryValues[i].due_date
      );

      expect(s3InvoiceValues[i].item_description).toEqual(
        athenaQueryValues[i].item_description
      );
      expect(s3InvoiceValues[i].service_name).toEqual(
        athenaQueryValues[i].service_name
      );
      expect(s3InvoiceValues[i].unit_price.toFixed(4)).toEqual(
        athenaQueryValues[i].unit_price
      );
      expect(s3InvoiceValues[i].quantity.toString()).toEqual(
        athenaQueryValues[i].quantity
      );
      expect(s3InvoiceValues[i].price.toFixed(4)).toEqual(
        athenaQueryValues[i].price
      );
    }
  });

  test("retrieved details from billing_curated athena view query should match with mock invoice data", async () => {
    const queryString =
      'SELECT * FROM "btm_billing_curated" ORDER BY vendor_name DESC, year DESC';
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObjects: BillingCurated[] = await queryObject(queryId);
    const invoiceQty = invoice.lineItems.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.quantity;
    }, 0);
    for (let i = 0; i < queryObjects.length; i++) {
      expect(invoice.vendor.name).toEqual(queryObjects[i].vendor_name);
      expect(invoiceQty.toString()).toEqual(queryObjects[i].quantity);
      expect(invoice.getSubtotal().toFixed(4)).toEqual(queryObjects[i].price);
     expect(invoice.date.getFullYear().toString()).toEqual(queryObjects[i].year)
     const getMonthFromInvoiceDate= `0${(invoice.date.getMonth() + 1)}`.toString()
     expect(getMonthFromInvoiceDate).toEqual(queryObjects[i].month)

    }
  });
});

interface BillingCurated {
  vendor_name: string;
  service_name: string;
  quantity: number;
  price: number;
  year: string;
  month: string;
}

import path from "path";
import fs from "fs";
import {
  BillingStandardised,
  checkIfS3ObjectExists,
  getS3ObjectsAsArray,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  queryObject,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";

const prefix = resourcePrefix();

describe("\nExecute athena query to retrieve invoice data and validate that it matches invoice files in storage s3 bucket\n", () => {
  const folderPrefix = "btm_billing_standardised";
  const testObject: S3Object = {
    bucket: `${prefix}-storage`,
    key: `${folderPrefix}/receipt.txt`,
  };
  const databaseName = `${prefix}-calculations`;

  beforeAll(async () => {
    // uploading file to s3 will be removed once BTM-276 implemented
    const file = "../payloads/receipt.txt";
    const filePath = path.join(__dirname, file);
    const fileData = fs.readFileSync(filePath);
    await putS3Object({ data: fileData, target: testObject });
    const checkFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkFileExists).toBeTruthy();
  });

  test("retrieved invoice details should match invoice data in s3 bucket", async () => {
    const queryString =
      'SELECT * FROM "btm_billing_standardised" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObj = await queryObject(queryId);
    const athenaQueryValues: BillingStandardised[] = Object.values(queryObj);
    const s3InvoiceValues = await getS3ObjectsAsArray(
      testObject.bucket,
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
      expect(s3InvoiceValues[i].tax.toFixed(2)).toEqual(
        athenaQueryValues[i].tax
      );
      expect(s3InvoiceValues[i].tax_payer_id).toEqual(
        athenaQueryValues[i].tax_payer_id
      );
      expect(s3InvoiceValues[i].item_id.toString()).toEqual(
        athenaQueryValues[i].item_id
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

  test("retrieved view query results should match s3", async () => {
    const s3Response = await getS3ObjectsAsArray(
      testObject.bucket,
      folderPrefix
    );
    const s3Objects = s3Response.map(
      (element: {
        vendor_name: string;
        service_name: string;
        price: number;
        quantity: number;
      }) => {
        return {
          vendor_name: element.vendor_name,
          service_name: element.service_name,
          price: element.price,
          quantity: element.quantity,
        };
      }
    );

    const queryString =
      'SELECT * FROM "btm_billing_curated" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObjects: BillingCurated[] = await queryObject(queryId);
    for (let i = 0; i < s3Response.length; i++) {
      expect(s3Objects[i].vendor_name).toEqual(queryObjects[i].vendor_name);
      expect(s3Objects[i].service_name).toEqual(queryObjects[i].service_name);
      expect(s3Objects[i].quantity.toString()).toEqual(
        queryObjects[i].quantity
      );
      expect(s3Objects[i].price.toFixed(4)).toEqual(queryObjects[i].price);
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

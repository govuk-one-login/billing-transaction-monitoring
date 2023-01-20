import {
  startQueryExecutionCommand,
  queryObject,
} from "../helpers/athenaHelper";
import {
  putObjectToS3,
  checkIfS3ObjectExists,
  s3GetObjectsToArray,
  S3Object,
  BillingStandardised,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import path from "path";
import fs from "fs";

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
    const fileStream = fs.createReadStream(filePath);
    await putObjectToS3(testObject, fileStream);
    const checkFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkFileExists).toBeTruthy();
  });

  test("retrieved invoice details should matches with invoice data in s3 bucket ", async () => {
    const queryString =
      'SELECT * FROM "btm_billing_standardised" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryObj = await queryObject(queryId);
    const queryObjectsVal: BillingStandardised[] = Object.values(queryObj);
    const s3Response = await s3GetObjectsToArray(
      testObject.bucket,
      folderPrefix
    );
    for (let i = 0; i < s3Response.length; i++) {
      expect(s3Response[i].invoice_receipt_id).toEqual(
        queryObjectsVal[i].invoice_receipt_id
      );
      expect(s3Response[i].vendor_name).toEqual(queryObjectsVal[i].vendor_name);
      expect(s3Response[i].total.toFixed(4)).toEqual(queryObjectsVal[i].total);
      expect(s3Response[i].invoice_receipt_date).toEqual(
        queryObjectsVal[i].invoice_receipt_date
      );
      expect(s3Response[i].subtotal.toFixed(4)).toEqual(
        queryObjectsVal[i].subtotal
      );
      expect(s3Response[i].due_date).toEqual(queryObjectsVal[i].due_date);
      expect(s3Response[i].tax.toFixed(2)).toEqual(queryObjectsVal[i].tax);
      expect(s3Response[i].tax_payer_id).toEqual(
        queryObjectsVal[i].tax_payer_id
      );
      expect(s3Response[i].item_id.toString()).toEqual(
        queryObjectsVal[i].item_id
      );
      expect(s3Response[i].item_description).toEqual(
        queryObjectsVal[i].item_description
      );
      expect(s3Response[i].service_name).toEqual(
        queryObjectsVal[i].service_name
      );
      expect(s3Response[i].unit_price.toFixed(4)).toEqual(
        queryObjectsVal[i].unit_price
      );
      expect(s3Response[i].quantity.toString()).toEqual(
        queryObjectsVal[i].quantity
      );
      expect(s3Response[i].price.toFixed(4)).toEqual(queryObjectsVal[i].price);
    }
  });

  test("retrieved view query results should matches with s3", async () => {
    const s3Response = await s3GetObjectsToArray(
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
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
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

import {
  startQueryExecutionCommand,
  formattedQueryResults,
  queryObject,
} from "../helpers/athenaHelper";
import {
  putObjectToS3,
  checkIfFileExists,
  s3GetObjectsToArray,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import path from "path";
import fs from "fs";

const prefix = resourcePrefix();

describe("\nExecute athena query to retrive invoice data and validate it matches with invoice files in storage s3 bucket\n", () => {
  const bucketName = `${prefix}-storage`;
  const bucketKey = "btm_billing_standardised/receipt.txt";
  const folderPrefix = "btm_billing_standardised";
  const databaseName = `${prefix}-invoices`;

  beforeAll(async () => {
    //uploading file to s3 will be removed once BTM-276 implemented
    const file = "../payloads/receipt.txt";
    const filePath = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filePath);
    await putObjectToS3(bucketName, bucketKey, fileStream);
    const checkFileExists = await checkIfFileExists(bucketName, bucketKey);
    expect(checkFileExists).toBeTruthy();
  });

  test("retrieved invoice details should matches with invoice data in s3 bucket ", async () => {
    const queryString = `SELECT * FROM "btm_billing_standardised" ORDER BY service_name ASC`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const strFromQuery = await queryObject(queryId);
    const queryObjects = Object.keys(strFromQuery).map(
      (val) => strFromQuery[val]
    );
    const s3Array = await s3GetObjectsToArray(bucketName, folderPrefix);
    const s3Objects = Object.keys(s3Array).map((val) => s3Array[val]);
    expect(s3Objects).toEqual(queryObjects);
  });

  test("retrieved view query results should matches with s3", async () => {
    const s3Array = await s3GetObjectsToArray(bucketName, folderPrefix);
    const s3Objects = s3Array.map(
      (element: {
        vendor_name: string;
        service_name: string;
        price: number;
      }) => {
        return {
          vendor_name: element.vendor_name,
          service_name: element.service_name,
          price: element.price,
        };
      }
    );

    const queryString = `SELECT * FROM "btm_billing_curated" ORDER BY service_name ASC`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const strFromQuery = await queryObject(queryId);
    const queryObjects = strFromQuery.map(
      (element: {
        vendor_name: string;
        service_name: string;
        price: string;
      }) => {
        return {
          vendor_name: element.vendor_name,
          service_name: element.service_name,
          price: element.price,
        };
      }
    );
    expect(s3Objects).toEqual(queryObjects);
  });
});

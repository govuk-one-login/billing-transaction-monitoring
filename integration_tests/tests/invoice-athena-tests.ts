import {
  startQueryExecutionCommand,
  formattedQueryResults,
} from "../helpers/athenaHelper";
import {
  getAllObjectsFromS3,
  putObjectToS3,
  checkIfFileExists,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import path from "path";
import fs from "fs";
import { removeTrailingZerosAfterDeciRegExp } from "../helpers/commonHelpers";

const prefix = resourcePrefix();

describe("\nExecute athena query to retrive invoice data and validate it matches with invoice files in storage s3 bucket\n", () => {
  const bucketName = `${prefix}-storage`;
  const bucketKey = "btm_invoices/receipt_0000.txt";
  const folderPrefix = "btm_invoices";
  const databaseName = `${prefix}-invoices`;

  beforeAll(async () => {
    //uploading file to s3 will be removed once BTM-276 implemented
    const file = "../payloads/receipt_0000.txt";
    const filePath = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filePath);
    await putObjectToS3(bucketName, bucketKey, fileStream);
    const checkFileExists = await checkIfFileExists(bucketName, bucketKey);
    expect(checkFileExists).toBeTruthy();
  });

  test("retrieved invoice details should matches with invoice data in s3 bucket ", async () => {
    const queryString = `SELECT * FROM "btm_invoices_standardised" ORDER BY invoice_receipt_id ASC, vendor_name asc;`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResults = await formattedQueryResults(queryId);
    const queryStr = JSON.stringify(queryResults);
    const formattedQueryStr = removeTrailingZerosAfterDeciRegExp(
      queryStr
    ).replace(/"/g, ""); //removes double quotes
    const response = await getAllObjectsFromS3(bucketName, folderPrefix);
    const strFromS3 = JSON.stringify(response);
    const formattedStrFromS3 = removeTrailingZerosAfterDeciRegExp(strFromS3) //removes trailing zeros after decimal point eg 1200.0 to 1200
      .replace(/\\n|"|\\/g, "") //removes newline, backslashes
      .replace(/}{/g, "},{"); //replace string }{ to },{
    expect(formattedStrFromS3).toEqual(formattedQueryStr);
  });

  test("retrieved view query results should matches with s3", async () => {
    const queryString = `SELECT * FROM \"${prefix}-invoice-line-item-view\"`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResults = await formattedQueryResults(queryId);
    const strFromQuery = JSON.stringify(queryResults);
    const s3Response = await getAllObjectsFromS3(bucketName, folderPrefix);
    const strFromS3 = JSON.stringify(s3Response);

    const checkStrFromQueryExistsInS3Response = async () => {
      if (strFromQuery.includes(strFromS3)) {
        return true;
      }
    };
    expect(checkStrFromQueryExistsInS3Response).toBeTruthy();
  });
});

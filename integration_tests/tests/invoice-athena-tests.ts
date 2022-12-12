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

const prefix = resourcePrefix();

describe("\nExecute athena query to retrive invoice data and validate it matches with files in standardised-invoice-data s3 bucket\n", () => {
  test("retrieved invoice details should matches with invoice data in s3 bucket ", async () => {
    const bucketName = `${resourcePrefix()}-standardised-invoice-data`;
    const bucketKey = "btm_invoices_standardised/receipt_0000.txt";
    const folderPrefix = "btm_invoices_standardised";

    //uploading file to s3 will be removed once BTM-276 implemented
    const file = "../payloads/receipt_0000.txt";
    const filePath = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filePath);
    await putObjectToS3(bucketName, bucketKey, fileStream);
    const checkFileExists = await checkIfFileExists(bucketName, bucketKey);
    expect(checkFileExists).toBeTruthy();

    const databaseName = `${prefix}-invoices`;
    const queryString = `SELECT * FROM "btm_invoices_standardised" ORDER BY invoice_receipt_id ASC, vendor_name asc;`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResults = await formattedQueryResults(queryId);
    const formattedQueryData = JSON.stringify(queryResults)
      .replace(/"(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)"/g, '"$1$2"') //removes trailing zeros after decimal point eg 1200.00 to 1200
      .replace(/"/g, ""); //removes double quotes
    const response = await getAllObjectsFromS3(bucketName, folderPrefix);
    const formattedDataFromS3 = JSON.stringify(response)
      .replace(/(\d+)(?:(\.\d*?[1-9])0*|\.0*)/g, '"$1$2"') //removes trailing zeros after decimal point eg 1200.0 to 1200
      .replace(/\\n|"|\\/g, "") //removes newline, backslashes
      .replace(/}{/g, "},{"); //replace string }{ to },{
    expect(formattedDataFromS3).toEqual(formattedQueryData);
  });
});

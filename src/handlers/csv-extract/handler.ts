import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import {
  fetchS3,
  getS3EventRecordsFromSqs,
  getVendorServiceConfigRows,
  putTextS3,
} from "../../shared/utils";
import { parseCsv } from "./parsing-utils/parse-csv";
import {
  CsvObject,
  getCsvStandardisedInvoice,
} from "./get-csv-standardised-invoice";

// TODO
// 1. Set up the dependencies - check for env vars
// 2. Write handler function to loop through each record, extract the bucket/file name, handle errors.
// 3. Add the fetchS3 function
// 3a. Add the parseCsv function
// 3b. Add the type guard for the CsvObject
// 4. Write the handler 'getCsvStandardised' function that will standardise the invoice
// 5. Add the 'putTextS3' function that will put the invoice data into the storage bucket (.txt)
// Note: Do not need to move the original invoice csv to the successful folder in the raw invoice bucket.
// 6. Handle errors with batchItemFailures

export const handler = async (event: SQSEvent): Promise<Response> => {
  const configBucket = process.env.CONFIG_BUCKET;
  if (configBucket === undefined || configBucket.length === 0)
    throw new Error("Config bucket not set.");

  const destinationBucket = process.env.DESTINATION_BUCKET;
  if (destinationBucket === undefined || destinationBucket.length === 0) {
    throw new Error("Destination bucket not set.");
  }

  const destinationFolder = process.env.DESTINATION_FOLDER;
  if (destinationFolder === undefined || destinationFolder.length === 0) {
    throw new Error("Destination folder not set.");
  }

  const response: Response = {
    batchItemFailures: [],
  };

  const promises = event.Records.map(async (record) => {
    try {
      const eventRecords = getS3EventRecordsFromSqs(record);

      for (const record of eventRecords) {
        const bucket = record.s3.bucket.name;
        const filePath = record.s3.object.key;

        // File must be in folder, which determines vendor ID. Throw error otherwise.
        const filePathParts = filePath.split("/");
        if (filePathParts.length < 2)
          throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);

        const vendorId = filePathParts[0];
        const sourceFileName = filePathParts[filePathParts.length - 1];

        const csv = await fetchS3(bucket, filePath);

        const parsedCsv = parseCsv(csv);
        console.log("parsedCsv", parsedCsv);

        if (!isValidCsvObject(parsedCsv)) {
          console.error("Csv is invalid.");
          throw new Error("Csv is invalid.");
        }

        const vendorServiceConfigRows = await getVendorServiceConfigRows(
          configBucket,
          { vendor_id: vendorId }
        );

        const standardisedInvoice = getCsvStandardisedInvoice(
          parsedCsv,
          vendorId,
          vendorServiceConfigRows
        );
        console.log("standardisedInvoice", standardisedInvoice);

        if (standardisedInvoice.length === 0) {
          console.error("No matching line items in csv invoice.");
          throw new Error("No matching line items in csv invoice.");
        }

        // Convert line items to new-line-separated JSON object text, to work with Glue/Athena.
        const standardisedInvoiceText = standardisedInvoice
          .map((lineItem) => JSON.stringify(lineItem))
          .join("\n");
        console.log("standardisedInvoiceText", standardisedInvoiceText);
        // Since that text block is not valid JSON, use a file extension that is not `.json`.
        const destinationFileName = sourceFileName.replace(/\.csv$/g, ".txt");

        await putTextS3(
          destinationBucket,
          `${destinationFolder}/${destinationFileName}`,
          standardisedInvoiceText
        );
      }
    } catch (error) {
      console.log(error);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  // TODO Look into promise.allSettled

  return response;
};

const isValidCsvObject = (x: any): x is CsvObject =>
  typeof x === "object" &&
  typeof x.Vendor === "string" &&
  typeof x["Invoice Date"] === "string" &&
  typeof x["Due Date"] === "string" &&
  typeof x["VAT Number"] === "string" &&
  typeof x["PO Number"] === "string" &&
  typeof x.Version === "string" &&
  Object.prototype.toString.call(x.lineItems) === "[object Array]" &&
  x.lineItems.every((lineItem: any) => isValidLineItem(lineItem));

const isValidLineItem = (x: any): x is CsvObject =>
  typeof x === "object" &&
  typeof x["Service Name"] === "string" &&
  typeof x["Unit Price"] === "string" &&
  typeof x.Quantity === "string" &&
  typeof x.Tax === "string" &&
  typeof x.Subtotal === "string";

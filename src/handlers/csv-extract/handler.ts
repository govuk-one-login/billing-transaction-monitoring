import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import {
  fetchS3,
  getS3EventRecordsFromSqs,
  getVendorServiceConfigRows,
  putTextS3,
  logger,
} from "../../shared/utils";
import { parseCsv } from "./parsing-utils/parse-csv";
import {
  CsvObject,
  getCsvStandardisedInvoice,
} from "./get-csv-standardised-invoice";

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

        if (!isValidCsvObject(parsedCsv)) {
          logger.error("Csv is invalid.");
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

        if (standardisedInvoice.length === 0) {
          logger.error("No matching line items in csv invoice.");
          throw new Error("No matching line items in csv invoice.");
        }

        // Convert line items to new-line-separated JSON object text, to work with Glue/Athena.
        const standardisedInvoiceText = standardisedInvoice
          .map((lineItem) => JSON.stringify(lineItem))
          .join("\n");
        // Since that text block is not valid JSON, use a file extension that is not `.json`.
        const destinationFileName = sourceFileName.replace(/\.csv$/g, ".txt");

        await putTextS3(
          destinationBucket,
          `${destinationFolder}/${destinationFileName}`,
          standardisedInvoiceText
        );
      }
    } catch (error) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
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

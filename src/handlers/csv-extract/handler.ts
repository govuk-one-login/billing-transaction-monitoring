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
  LineItem,
} from "./get-csv-standardised-invoice";
import { getStandardisedInvoiceFileName } from "../../shared/utils/get-standardised-invoice-filename";

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

      const recordPromises = eventRecords.map(async (eventRecord) => {
        const bucket = eventRecord.s3.bucket.name;
        const filePath = eventRecord.s3.object.key;

        // File must be in folder, which determines vendor ID. Throw error otherwise.
        const filePathParts = filePath.split("/");
        if (filePathParts.length < 2)
          throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);

        const vendorId = filePathParts[0];
        const sourceFileName = filePathParts[filePathParts.length - 1];

        const csv = await fetchS3(bucket, filePath);

        const parsedCsv = parseCsv(csv);

        if (!isValidCsvObject(parsedCsv)) {
          throw new Error("Csv is invalid.");
        }

        const vendorServiceConfigRows = await getVendorServiceConfigRows(
          configBucket,
          { vendor_id: vendorId }
        );

        const standardisedInvoice = getCsvStandardisedInvoice(
          parsedCsv,
          vendorId,
          vendorServiceConfigRows,
          sourceFileName
        );

        if (standardisedInvoice.length === 0) {
          throw new Error("No matching line items in csv invoice.");
        }

        for (const item of standardisedInvoice) {
          const fileName = getStandardisedInvoiceFileName(item);
          const standardisedInvoiceText = JSON.stringify(item);
          // Storage will be moved to a new lambda as part of BTM-466
          await putTextS3(
            destinationBucket,
            `${destinationFolder}/${fileName}`,
            standardisedInvoiceText
          );
        }
      });

      await Promise.all(recordPromises);
    } catch (error) {
      logger.error("Handler failure", { error });
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
  Array.isArray(x.lineItems) &&
  x.lineItems.every((lineItem: any) => isValidLineItem(lineItem));

const isValidLineItem = (x: any): x is LineItem =>
  typeof x === "object" &&
  typeof x["Service Name"] === "string" &&
  typeof x["Unit Price"] === "string" &&
  typeof x.Quantity === "string" &&
  typeof x.Tax === "string" &&
  typeof x.Subtotal === "string";

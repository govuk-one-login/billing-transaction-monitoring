import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import {
  fetchS3,
  getFromEnv,
  getS3EventRecordsFromSqs,
  getVendorServiceConfigRows,
  logger,
  sendRecord,
} from "../../shared/utils";
import { parseCsv } from "./parsing-utils/parse-csv";
import {
  CsvObject,
  getCsvStandardisedInvoice,
  LineItem,
} from "./get-csv-standardised-invoice";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const configBucket = getFromEnv("CONFIG_BUCKET");
  if (configBucket === undefined || configBucket.length === 0)
    throw new Error("Config bucket not set.");

  const outputQueueUrl = getFromEnv("OUTPUT_QUEUE_URL");
  if (outputQueueUrl === undefined || outputQueueUrl.length === 0) {
    throw new Error("Output queue URL not set.");
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

        const vendorServiceConfigRows = await getVendorServiceConfigRows({
          vendor_id: vendorId,
        });

        const standardisedInvoice = getCsvStandardisedInvoice(
          parsedCsv,
          vendorId,
          vendorServiceConfigRows,
          sourceFileName
        );

        if (standardisedInvoice.length === 0) {
          throw new Error("No matching line items in csv invoice.");
        }

        const lineItemPromises = standardisedInvoice.map(async (item) => {
          const standardisedInvoiceText = JSON.stringify(item);
          await sendRecord(outputQueueUrl, standardisedInvoiceText);
        });

        await Promise.all(lineItemPromises);
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
  typeof x.vendor === "string" &&
  typeof x["invoice period start"] === "string" &&
  typeof x["invoice period end"] === "string" &&
  typeof x["invoice date"] === "string" &&
  typeof x["invoice period start"] === "string" &&
  typeof x["due date"] === "string" &&
  typeof x["vat number"] === "string" &&
  typeof x["po number"] === "string" &&
  typeof x.version === "string" &&
  Array.isArray(x.lineItems) &&
  x.lineItems.every((lineItem: any) => isValidLineItem(lineItem));

const isValidLineItem = (x: any): x is LineItem =>
  typeof x === "object" &&
  typeof x["service name"] === "string" &&
  typeof x["unit price"] === "string" &&
  typeof x.quantity === "string" &&
  typeof x.tax === "string" &&
  typeof x.subtotal === "string";

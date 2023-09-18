import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { getFromEnv, logger } from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const archiveFolder = getFromEnv("ARCHIVE_FOLDER");

  if (archiveFolder === undefined || archiveFolder.length === 0)
    throw new Error("Archive folder not set.");

  const destinationBucket = getFromEnv("DESTINATION_BUCKET");

  if (destinationBucket === undefined || destinationBucket.length === 0)
    throw new Error("Destination bucket not set.");

  const destinationFolder = getFromEnv("DESTINATION_FOLDER");

  if (destinationFolder === undefined || destinationFolder.length === 0)
    throw new Error("Destination folder not set.");

  const rawInvoiceBucket = getFromEnv("RAW_INVOICE_BUCKET");

  if (rawInvoiceBucket === undefined || rawInvoiceBucket.length === 0)
    throw new Error("Raw invoice bucket not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeLineItem(
        record,
        destinationBucket,
        destinationFolder,
        archiveFolder,
        rawInvoiceBucket
      );
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

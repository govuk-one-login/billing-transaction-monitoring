import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { logger } from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const archiveFolder = process.env.ARCHIVE_FOLDER;

  if (archiveFolder === undefined || archiveFolder.length === 0)
    throw new Error("Archive folder not set.");

  const bucket = process.env.DESTINATION_BUCKET;

  if (bucket === undefined || bucket.length === 0)
    throw new Error("Destination bucket not set.");

  const destinationFolder = process.env.DESTINATION_FOLDER;

  if (destinationFolder === undefined || destinationFolder.length === 0)
    throw new Error("Destination folder not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeLineItem(record, bucket, destinationFolder, archiveFolder);
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

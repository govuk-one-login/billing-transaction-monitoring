import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { logger } from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const bucket = process.env.DESTINATION_BUCKET;

  if (bucket === undefined || bucket.length === 0)
    throw new Error("Destination bucket not set.");

  const destinationFolder = process.env.DESTINATION_FOLDER;

  if (destinationFolder === undefined || destinationFolder.length === 0)
    throw new Error("Destination folder not set.");

  // TODO remove as part of BTM-486.
  const legacyDestinationFolder = process.env.LEGACY_DESTINATION_FOLDER;
  if (
    legacyDestinationFolder === undefined ||
    legacyDestinationFolder.length === 0
  )
    throw new Error("Legacy destination folder not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeLineItem(
        record,
        bucket,
        destinationFolder,
        legacyDestinationFolder
      );
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

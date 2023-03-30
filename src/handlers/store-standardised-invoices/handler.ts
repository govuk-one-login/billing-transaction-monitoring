import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { logger } from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const bucket = process.env.DESTINATION_BUCKET;

  if (bucket === undefined || bucket.length === 0)
    throw new Error("Destination bucket not set.");

  const folder = process.env.DESTINATION_FOLDER;

  if (folder === undefined || folder.length === 0)
    throw new Error("Destination folder not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeLineItem(record, bucket, folder);
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

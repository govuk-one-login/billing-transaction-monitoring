import { SQSEvent, SQSRecord } from "aws-lambda";
import { Response } from "../../shared/types";
import { formatDate, logger, putS3 } from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeRecord(record);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

async function storeRecord(record: SQSRecord): Promise<void> {
  const bodyObject = JSON.parse(record.body);
  const { event_id: eventId, timestamp } = bodyObject;

  if (typeof eventId !== "string") {
    const message = "No valid event ID in record.";
    logger.error(message);
    throw new Error(message);
  }

  if (
    process.env.STORAGE_BUCKET === undefined ||
    process.env.STORAGE_BUCKET.length === 0
  ) {
    const message = "Storage bucket name not set.";
    logger.error(message);
    throw new Error(message);
  }

  if (
    process.env.TRANSACTIONS_FOLDER === undefined ||
    process.env.TRANSACTIONS_FOLDER.length === 0
  ) {
    const message = "Transactions folder name not set.";
    logger.error(message);
    throw new Error(message);
  }

  const date = new Date(timestamp);
  const formattedDate = formatDate(date);

  const key = `${formattedDate}/${eventId}.json`;

  logger.info("Storing event " + eventId);
  await putS3(
    process.env.STORAGE_BUCKET,
    process.env.TRANSACTIONS_FOLDER + "/" + key,
    bodyObject
  );
}

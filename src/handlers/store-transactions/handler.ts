import { ConfigElements, buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { isValidIncomingCleanedEventBody } from "./is-valid-incoming-cleaned-event-body";
import { formatDate, putTextS3 } from "../../shared/utils";
import { CleanedEventBody, Env } from "./types";

const argsGenerator = (message: CleanedEventBody): [string] => {
  const { event_id, timestamp } = message;
  const key = `${formatDate(new Date(timestamp), "/")}/${event_id}.json`;
  return [key];
};

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.STORAGE_BUCKET, Env.EVENT_DATA_FOLDER],
  incomingMessageBodyTypeGuard: isValidIncomingCleanedEventBody,
  outputs: [
    { destination: Env.STORAGE_BUCKET, store: putTextS3, argsGenerator },
  ],
  withBatchItemFailures: true,
  ConfigCache: [],
});

// export const handler = async (event: SQSEvent): Promise<Response> => {
//   const response: Response = { batchItemFailures: [] };

//   const promises = event.Records.map(async (record) => {
//     try {
//       await storeRecord(record);
//     } catch (e) {
//       response.batchItemFailures.push({ itemIdentifier: record.messageId });
//     }
//   });

//   await Promise.all(promises);
//   return response;
// };

// async function storeRecord(record: SQSRecord): Promise<void> {
// const bodyObject = JSON.parse(record.body);
//   const { event_id: eventId, timestamp } = bodyObject;

//   if (typeof eventId !== "string") {
//     const message = "No valid event ID in record.";
//     logger.error(message);
//     throw new Error(message);
//   }

//   if (
//     process.env.STORAGE_BUCKET === undefined ||
//     process.env.STORAGE_BUCKET.length === 0
//   ) {
//     const message = "Storage bucket name not set.";
//     logger.error(message);
//     throw new Error(message);
//   }

//   if (
//     process.env.EVENT_DATA_FOLDER === undefined ||
//     process.env.EVENT_DATA_FOLDER.length === 0
//   ) {
//     const message = "Event data folder name not set.";
//     logger.error(message);
//     throw new Error(message);
//   }

//   logger.info("Storing event " + eventId);

//   const date = new Date(timestamp);
//   const key = `${formatDate(date, "/")}/${eventId}.json`;
//   await putS3(
//     process.env.STORAGE_BUCKET,
//     process.env.EVENT_DATA_FOLDER + "/" + key,
//     bodyObject
//   );
// }

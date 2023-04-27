import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { isValidIncomingCleanedEventBody } from "./is-valid-incoming-cleaned-event-body";
import { formatDate, putTextS3 } from "../../shared/utils";
import { CleanedEventBody, Env } from "./types";

const store =async  (bucket: string, message: CleanedEventBody): Promise<void> => {
  const { event_id, timestamp } = message;
  const key = `${formatDate(new Date(timestamp), "/")}/${event_id}.json`;
  await putTextS3(bucket, key, JSON.stringify(message))
};

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.STORAGE_BUCKET, Env.EVENT_DATA_FOLDER],
  incomingMessageBodyTypeGuard: isValidIncomingCleanedEventBody,
  outputs: [
    { destination: Env.STORAGE_BUCKET, store },
  ],
  withBatchItemFailures: true,
  ConfigCache: [],
});

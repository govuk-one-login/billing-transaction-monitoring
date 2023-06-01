import { HandlerCtx } from "../../handler-context";
import { formatDate, putTextS3 } from "../../shared/utils";
import { CleanedEventBody, Env } from "./types";

export const store = async (
  bucket: string,
  message: CleanedEventBody,
  { env }: HandlerCtx<Env, never, CleanedEventBody>
): Promise<void> => {
  const { event_id, timestamp } = message;
  const key = `${env.EVENT_DATA_FOLDER}/${formatDate(
    new Date(timestamp),
    "/"
  )}/${event_id}.json`;
  await putTextS3(bucket, key, JSON.stringify(message));
};

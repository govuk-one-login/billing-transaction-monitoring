import { formatDate, putTextS3 } from "../../shared/utils";
import { CleanedEventBody } from "./types";

export const store = async (
  bucket: string,
  message: CleanedEventBody
): Promise<void> => {
  const { event_id, timestamp } = message;
  const key = `${formatDate(new Date(timestamp), "/")}/${event_id}.json`;
  await putTextS3(bucket, key, JSON.stringify(message));
};

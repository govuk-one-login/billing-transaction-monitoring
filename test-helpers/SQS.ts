import { SQSEvent, SQSRecord } from "aws-lambda";

export const createEvent = (records: SQSRecord[]): SQSEvent => ({
  Records: records,
});

export const createEventRecordWithName = (
  name: String,
  messageId: Number
): SQSRecord =>
  ({
    body: JSON.stringify({
      event_name: name,
      timestamp: Date.now(),
      event_id: String(Math.floor(Math.random() * 100000)),
    }),
    messageId: String(messageId),
  } as any);

export const createEventRecordWithS3data = (body: String): SQSRecord =>
  ({
    body,
  } as any);

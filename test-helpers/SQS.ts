import { SQSEvent, SQSRecord } from "aws-lambda";

export const createEvent = (records: SQSRecord[]): SQSEvent => ({
  Records: records,
});

export const createEventRecordWithName = (
  name: string,
  messageId: number
): SQSRecord =>
  ({
    body: JSON.stringify({
      event_name: name,
      timestamp: Date.now(),
      event_id: String(Math.floor(Math.random() * 100000)),
    }),
    messageId: String(messageId),
  } as any);

export const createEventRecordWithS3Body = (
  bucketName: string,
  fileName: string,
  messageId: string
): SQSRecord =>
  ({
    body: JSON.stringify({
      Records: [
        {
          s3: {
            bucket: {
              name: bucketName,
            },
            object: {
              key: fileName,
            },
          },
        },
      ],
    }),
    messageId,
  } as any);

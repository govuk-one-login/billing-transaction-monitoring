import { S3Event, S3EventRecord } from "aws-lambda";

export const createEvent = (records: S3EventRecord[]): S3Event => ({
  Records: records,
});

export const createS3EventRecord = (
  bucketName: string,
  fileName: string
): S3EventRecord =>
  ({
    s3: {
      bucket: {
        name: bucketName,
      },
      object: {
        key: fileName,
      },
    },
  } as unknown as S3EventRecord);

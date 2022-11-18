import { S3Event, S3EventRecord } from "aws-lambda";

export const createEvent = (records: S3EventRecord[]): S3Event => ({
  Records: records,
});

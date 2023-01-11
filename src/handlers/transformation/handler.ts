import { S3Event } from "aws-lambda";

export const handler = async (event: S3Event): Promise<void> => {
  console.log("event:", JSON.stringify(event.Records[0].s3));
};

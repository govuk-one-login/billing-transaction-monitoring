import { S3Client } from "@aws-sdk/client-s3";

export const region = "eu-west-2";

export const s3Client = new S3Client({
  region,
  endpoint: process.env.S3_LOCALENDPOINT,
});

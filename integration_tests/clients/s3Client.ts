import { S3Client } from "@aws-sdk/client-s3";

const region = "eu-west-2";

const s3Client = new S3Client({
  region: `${region}`,
  endpoint: process.env.S3_LOCALENDPOINT,
});

export { s3Client };

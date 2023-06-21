import { AthenaClient } from "@aws-sdk/client-athena";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

export const region = "eu-west-2";

export const athenaClient = new AthenaClient({
  region,
  endpoint: process.env.LOCAL_ENDPOINT,
});

export const cloudWatchLogsClient = new CloudWatchLogsClient({
  region,
  endpoint: process.env.LOCAL_ENDPOINT,
});

export const s3Client = new S3Client({
  region,
  endpoint: process.env.S3_LOCALENDPOINT,
});

export const lambdaClient = new LambdaClient({ region });

export const sesClient = new SESClient({ region: "eu-west-1" });

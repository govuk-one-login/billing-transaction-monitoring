import { AthenaClient } from "@aws-sdk/client-athena";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import AWS from "aws-sdk";
import { AWS_REGION } from "../../shared/constants";

export const athenaClient = new AthenaClient({
  region: AWS_REGION,
  endpoint: process.env.LOCAL_ENDPOINT,
});

export const cloudWatchLogsClient = new CloudWatchLogsClient({
  region: AWS_REGION,
  endpoint: process.env.LOCAL_ENDPOINT,
});

export const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: process.env.S3_LOCALENDPOINT,
});

export const lambdaClient = new LambdaClient({ region: AWS_REGION });

export const kms = new AWS.KMS({
  region: AWS_REGION,
});

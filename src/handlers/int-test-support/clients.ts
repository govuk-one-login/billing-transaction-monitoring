import { AthenaClient } from "@aws-sdk/client-athena";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import { SNSClient } from "@aws-sdk/client-sns";

export const region = "eu-west-2";

export const athenaClient = new AthenaClient({
  region,
  endpoint: process.env.LOCAL_ENDPOINT,
});

export const cloudWatchLogsClient = new CloudWatchLogsClient({
  region,
  endpoint: process.env.LOCAL_ENDPOINT,
});

const awsConfig = { region, endpoint: process.env.S3_LOCALENDPOINT, httpOtions: {timeOut: 50000}}

export const s3Client = new S3Client(awsConfig);

export const snsClient = new SNSClient(awsConfig);

export const lambdaClient = new LambdaClient({ region });

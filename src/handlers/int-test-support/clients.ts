import { AthenaClient } from "@aws-sdk/client-athena";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { STSClient } from "@aws-sdk/client-sts";
import { KMS } from "@aws-sdk/client-kms";
import { AWS_REGION } from "../../shared/constants";

export const athenaClient = new AthenaClient({ region: AWS_REGION });

export const cloudWatchLogsClient = new CloudWatchLogsClient({
  region: AWS_REGION,
});

export const s3Client = new S3Client({ region: AWS_REGION });

export const stsClient = new STSClient({ region: AWS_REGION });

export const sqsClient = new SQSClient({ region: AWS_REGION });

export const lambdaClient = new LambdaClient({ region: AWS_REGION });

export const kms = new KMS({ region: AWS_REGION });

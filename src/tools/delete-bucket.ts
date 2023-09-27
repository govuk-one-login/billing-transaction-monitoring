/**
 * This script deletes an S3 bucket which is defined in the env variable BUCKET by emptying it first and then deleting the bucket itself.
 */

import { S3Client } from "@aws-sdk/client-s3";
import { AWS_REGION } from "../shared/constants";
import { getFromEnv } from "../shared/utils";
import { clearBucket, deleteEmptyBucket } from "./common";

const awsConfig = { region: AWS_REGION };
const s3Client = new S3Client(awsConfig);

const bucketName = getFromEnv("BUCKET");

if (bucketName === undefined || bucketName === null || bucketName === "") {
  throw new Error("Please specify a bucket name in the env var BUCKET.");
}

const result = await clearBucket(s3Client, bucketName);
result.errorObjects.forEach((err) =>
  console.log(`Bucket: ${bucketName}: Error deleting object ${err.Key}`)
);

await deleteEmptyBucket(s3Client, bucketName);

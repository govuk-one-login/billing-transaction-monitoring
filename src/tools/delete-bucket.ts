/**
 * This script deletes an S3 bucket which is defined in the env variable BUCKET by emptying it first and then deleting the bucket itself.
 */

import {
  DeleteBucketCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AWS_REGION } from "../shared/constants";
import { getFromEnv } from "../shared/utils";

interface AWSError {
  error: any;
}

const isAWSError = (object: any): object is AWSError =>
  (object as AWSError).error;

const isNull = (object: any): object is null => object === null;

const deleteObject = async (
  bucket: string,
  objectName: string,
  version: string
): Promise<string | null> => {
  const result = await s3Client
    .send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectName,
        VersionId: version,
      })
    )
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteObject: ', result);
  if (isAWSError(result)) {
    console.log(
      `Bucket: ${bucket}: Error deleting ${objectName}: ${
        result.error as string
      }`
    );
    return objectName;
  } else return null;
};

const deleteEmptyBucket = async (bucket: string): Promise<string | null> => {
  const result = await s3Client
    .send(new DeleteBucketCommand({ Bucket: bucket }))
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteBucket: ', result);
  if (isAWSError(result)) {
    console.log(
      `Bucket: ${bucket}: Error during deletion: ${result.error as string}`
    );
    return bucket;
  } else {
    console.log(`Bucket: ${bucket}: Successfully deleted.`);
    return null;
  }
};

const clearBucket = async (bucket: string): Promise<string | null> => {
  const result = await s3Client
    .send(new ListObjectVersionsCommand({ Bucket: bucket }))
    .catch((err) => {
      return { error: err };
    });
  // console.log('listObjectVersions: ', result);
  if (isAWSError(result)) {
    console.log(`error listing bucket objects: ${result.error as string}`);
    return bucket;
  }

  const items = [...(result.Versions ?? []), ...(result.DeleteMarkers ?? [])];
  const deleteResults = await Promise.all(
    items.map(
      async (item) =>
        await deleteObject(bucket, item.Key ?? "", item.VersionId ?? "")
    )
  );
  const deleteCount = deleteResults.filter(isNull).length;
  console.log(
    `Bucket: ${bucket}: ${deleteCount} objects deleted, ${
      deleteResults.length - deleteCount
    } errors encountered`
  );

  if (deleteResults.length > deleteCount) return bucket;
  if (result.IsTruncated ?? false) return await clearBucket(bucket);
  return null;
};

const deleteBucket = async (bucket: string): Promise<string | null> => {
  await clearBucket(bucket);
  return await deleteEmptyBucket(bucket);
};

const awsConfig = { region: AWS_REGION };
const s3Client = new S3Client(awsConfig);

const bucketName = getFromEnv("BUCKET");

if (bucketName === undefined || bucketName === null || bucketName === "") {
  throw new Error("Please specify a bucket name in the env var BUCKET.");
}

await deleteBucket(bucketName);

import { s3Client } from "../clients/s3Client";
import {
  ListBucketsCommandOutput,
  ListBucketsCommand,
  ListObjectsCommand,
  ListObjectsCommandInput,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

async function getBucketList() {
  const params = {};
  const response: ListBucketsCommandOutput = await s3Client.send(
    new ListBucketsCommand({})
  );
  return response.Buckets ?? [];
}

async function getBucketName(s3bucketName: string) {
  const bucketList = await getBucketList();
  const bucketName = bucketList.find((item) => item.Name?.match(s3bucketName));
  if (bucketName != null) {
    return bucketName.Name?.valueOf() as string;
  } else {
    throw Error("No matching bucket name found");
  }
}

async function getS3ItemsList(bucketNameMatchString: string) {
  const bucketParams = {
    Bucket: await getBucketName(bucketNameMatchString),
  };
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
}

async function getS3Object(bucketNameMatchString: string, key: string) {
  const bucketParams = {
    Bucket: await getBucketName(bucketNameMatchString),
    Key: key,
  };
  const getObjectResult = await s3Client.send(
    new GetObjectCommand(bucketParams)
  );
  return getObjectResult.Body?.transformToString();
}

export { getS3ItemsList, getS3Object };

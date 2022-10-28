import { s3Client } from "../clients/s3Client";
import {
  ListBucketsCommandOutput,
  ListBucketsCommand,
  ListObjectsCommand,
  ListObjectsCommandInput,
} from "@aws-sdk/client-s3";

async function getBucketList() {
  const params = {};
  const response: ListBucketsCommandOutput = await s3Client.send(
    new ListBucketsCommand({})
  );
  return response.Buckets ?? [];
}

async function getBucketName(s3bucketName: any) {
  const bucketList = await getBucketList();
  const bucketName = bucketList.find((item) =>
    item.Name?.match(s3bucketName)
  );
  if (bucketName != null) {
    return bucketName.Name?.valueOf() as string;
  } else {
    throw Error("No matching bucket name found");
  }
}

async function getS3ItemsList(bucketName: any) {
  const bucketParams = {
    Bucket: await getBucketName(bucketName),
  };
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
}

export { getS3ItemsList };

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
  console.log(response.Buckets ?? []);
  return response.Buckets ?? [];
}

async function getBucketName() {
  const bucketList = await getBucketList();
  const bucketName = bucketList.find((item) =>
    item.Name?.match("di-btm-storagebucket")
  );
  if (bucketName != null) {
    console.log(bucketName.Name?.valueOf() as string);
    return bucketName.Name?.valueOf() as string;
  } else {
    throw Error("No matching bucket name found");
  }
}

async function getS3ItemsList() {
  const bucketParams = {
    Bucket: await getBucketName(),
  };
  console.log(bucketParams);
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
}

export { getS3ItemsList };

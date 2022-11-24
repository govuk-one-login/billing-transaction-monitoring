import { s3Client } from "../clients/s3Client";
import {
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { ReadStream } from "fs";

async function getS3ItemsList(bucketName: string) {
  const bucketParams = {
    Bucket: bucketName,
  };
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
}

async function getS3Object(bucketName: string, key: string) {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
  };
  const getObjectResult = await s3Client.send(
    new GetObjectCommand(bucketParams)
  );
  return getObjectResult.Body?.transformToString();
}

async function putObjectToS3(
  bucketName: string,
  key: string,
  body: ReadStream
) {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
    Body: body,
  };
  const response = await s3Client.send(new PutObjectCommand(bucketParams));
  return response;
}

async function deleteObjectInS3(bucketName: string, key: string) {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
  };
  const response = await s3Client.send(new DeleteObjectCommand(bucketParams));
  return response;
}

async function copyObject(
  destinationBucketName: string,
  sourceKey: string,
  destinationKey: string
) {
  const bucketParams = {
    Bucket: destinationBucketName,
    CopySource: sourceKey,
    Key: destinationKey,
  };

  console.log(bucketParams);
  const response = await s3Client.send(new CopyObjectCommand(bucketParams));
  return response;
}

async function checkIfFileExists(bucketName: string, key: string) {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
  };
  try {
    const data: HeadObjectCommandOutput = await s3Client.send(
      new HeadObjectCommand(bucketParams)
    );
    const exists = data.$metadata.httpStatusCode === 200;
    return exists;
  } catch (err) {
    if (err instanceof Error) console.log(err.name);
    return false;
  }
}

export {
  getS3ItemsList,
  getS3Object,
  putObjectToS3,
  deleteObjectInS3,
  copyObject,
  checkIfFileExists,
};

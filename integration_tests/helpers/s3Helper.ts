import { s3Client } from "../clients/s3Client";
import {
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { ReadStream } from "fs";

async function getS3ItemsList(bucketName: string, prefix?: string) {
  const bucketParams = {
    Bucket: bucketName,
    Prefix: prefix
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

async function putObjectToS3(bucketName: string, key: string, body: ReadStream) {
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

export { getS3ItemsList, getS3Object, putObjectToS3, deleteObjectInS3 };

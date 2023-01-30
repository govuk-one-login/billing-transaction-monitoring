import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { Command, SmithyConfiguration } from "@aws-sdk/smithy-client";
import { S3Event, S3EventRecord, SQSRecord } from "aws-lambda";

const s3 = new S3Client({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});

export async function deleteS3(bucket: string, key: string): Promise<void> {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await send(deleteCommand);
}

export const getS3EventRecordsFromSqs = (
  queueRecord: SQSRecord
): S3EventRecord[] => {
  let bodyObject;
  try {
    bodyObject = JSON.parse(queueRecord.body);
  } catch {
    throw new Error("Record body not valid JSON.");
  }

  if (typeof bodyObject !== "object")
    throw new Error("Record body not object.");

  if (!isS3Event(bodyObject))
    throw new Error("Event record body not valid S3 event.");

  return bodyObject.Records;
};

export async function fetchS3(bucket: string, key: string): Promise<string> {
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await send(getCommand);
  const data = await response.Body?.transformToString();
  if (data === undefined) throw new Error(`No data found in ${bucket}/${key}`);

  return data;
}

const isS3Event = (object: any): object is S3Event =>
  Array.isArray(object.Records) &&
  object.Records.every(
    (record: any) =>
      typeof record?.s3?.bucket?.name === "string" &&
      typeof record?.s3?.object?.key === "string"
  );

export async function moveS3(
  sourceBucket: string,
  sourceKey: string,
  destinationBucket: string,
  destinationKey: string
): Promise<void> {
  const copyCommand = new CopyObjectCommand({
    Bucket: destinationBucket,
    CopySource: `${sourceBucket}/${sourceKey}`,
    Key: destinationKey,
  });

  await send(copyCommand);

  await deleteS3(sourceBucket, sourceKey);
}

export const moveToFolderS3 = async (
  bucket: string,
  key: string,
  folder: string
): Promise<void> => await moveS3(bucket, key, bucket, `${folder}/${key}`);

export async function putS3(
  bucket: string,
  key: string,
  item: Object
): Promise<void> {
  const body = JSON.stringify(item);
  await putTextS3(bucket, key, body);
}

export async function putTextS3(
  bucket: string,
  key: string,
  body: string
): Promise<void> {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  });

  await send(putCommand);
}

const send = async <T extends ServiceInputTypes, U extends ServiceOutputTypes>(
  command: Command<T, U, SmithyConfiguration<{}>>
): Promise<U> =>
  await s3
    .send(command)
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((err) => {
      console.log(err, err.stack);
      throw err;
    });

import crypto from "node:crypto";
import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
  GetObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import type { Command, SmithyConfiguration } from "@aws-sdk/smithy-client";
import { S3Event, S3EventRecord, SQSRecord } from "aws-lambda";
import { logger } from "./logger";
import { decryptKms } from "./kms";

type EncryptedS3ObjectMetadata = {
  "x-amz-cek-alg": string;
  "x-amz-iv": string;
  "x-amz-key-v2": string;
  "x-amz-matdesc": string;
  "x-amz-tag-len": string;
};

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
  const responseBody = response.Body;

  if (responseBody === undefined)
    throw new Error(`No data found in ${bucket}/${key}`);

  const metadata = response.Metadata ?? {};

  if (isEncryptedS3ObjectMetadata(metadata)) {
    const responseBodyBytes = await responseBody.transformToByteArray();
    return await getDecrypted(responseBodyBytes, metadata);
  }

  return await responseBody.transformToString();
}

const getDecrypted = async (
  encryptedBytes: Uint8Array,
  metadata: EncryptedS3ObjectMetadata
): Promise<string> => {
  const {
    "x-amz-cek-alg": encryptionAlgorithmName,
    "x-amz-iv": initialisationVectorBase64Text,
    "x-amz-key-v2": encryptedKey,
    "x-amz-matdesc": keyContextText,
    "x-amz-tag-len": authTagBitCountText,
  } = metadata;

  if (encryptionAlgorithmName !== "AES/GCM/NoPadding")
    throw Error(`Unsupported encryption algorithm: ${encryptionAlgorithmName}`);

  const encryptedKeyBuffer = Buffer.from(encryptedKey, "base64");

  const keyContext = JSON.parse(keyContextText);
  if (typeof keyContext !== "object" || keyContext === null)
    throw Error("Invalid key context");

  const key = await decryptKms(encryptedKeyBuffer, keyContext);

  const authTagLength = parseInt(authTagBitCountText, 10) / 8;
  const authTag = encryptedBytes.slice(-authTagLength);
  const data = encryptedBytes.slice(0, -authTagLength);

  const initialisationVector = Buffer.from(
    initialisationVectorBase64Text,
    "base64"
  );

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    initialisationVector
  );

  if (authTagLength > 0) decipher.setAuthTag(authTag);

  return decipher.update(data, undefined, "utf-8") + decipher.final("utf-8");
};

const isEncryptedS3ObjectMetadata = (
  x: unknown
): x is EncryptedS3ObjectMetadata =>
  typeof x === "object" &&
  x !== null &&
  "x-amz-cek-alg" in x &&
  typeof x["x-amz-cek-alg"] === "string" &&
  "x-amz-iv" in x &&
  typeof x["x-amz-iv"] === "string" &&
  "x-amz-key-v2" in x &&
  typeof x["x-amz-key-v2"] === "string" &&
  "x-amz-matdesc" in x &&
  typeof x["x-amz-matdesc"] === "string" &&
  "x-amz-tag-len" in x &&
  typeof x["x-amz-tag-len"] === "string";

const isS3Event = (object: any): object is S3Event =>
  Array.isArray(object.Records) &&
  object.Records.every(
    (record: any) =>
      typeof record?.s3?.bucket?.name === "string" &&
      typeof record?.s3?.object?.key === "string"
  );

export const listS3Keys = async (
  bucket: string,
  prefix: string
): Promise<string[]> => {
  const listCommand = new ListObjectsCommand({
    Bucket: bucket,
    Prefix: prefix,
  });

  const result = await send(listCommand);

  if (result.Contents === undefined) return [];

  const keys: Array<string | undefined> = result.Contents.map(({ Key }) => Key);
  return keys.filter((key) => key !== undefined) as string[];
};

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
): Promise<void> => {
  const keyParts = key.split("/");
  const fileName = keyParts[keyParts.length - 1];
  await moveS3(bucket, key, bucket, `${folder}/${fileName}`);
};

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
      logger.info("Sent S3 command", { metadata: data.$metadata });
      return data;
    })
    .catch((err) => {
      logger.error("S3 command send error", { error: err });
      throw err;
    });

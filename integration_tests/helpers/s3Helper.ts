import { s3Client } from "../clients/s3Client";
import {
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommandOutput,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  CopyObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { ReadStream } from "fs";

async function getS3ItemsList(
  bucketName: string,
  prefix?: string
): Promise<ListObjectsCommandOutput> {
  const bucketParams = {
    Bucket: bucketName,
    Prefix: prefix,
  };
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
}

async function getS3Object(
  bucketName: string,
  key: string
): Promise<string | undefined> {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
  };
  const getObjectResult = await s3Client.send(
    new GetObjectCommand(bucketParams)
  );
  return await getObjectResult.Body?.transformToString();
}

async function putObjectToS3(
  bucketName: string,
  key: string,
  body: ReadStream
): Promise<PutObjectCommandOutput> {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
    Body: body,
  };
  const response = await s3Client.send(new PutObjectCommand(bucketParams));
  return response;
}

async function deleteObjectInS3(
  bucketName: string,
  key: string
): Promise<DeleteObjectCommandOutput> {
  const bucketParams = {
    Bucket: bucketName,
    Key: key,
  };
  const response = await s3Client.send(new DeleteObjectCommand(bucketParams));
  return response;
}

async function deleteDirectoryRecursiveInS3(
  bucketName: string,
  prefix?: string
): Promise<DeleteObjectCommandOutput[]> {
  const result = await getS3ItemsList(bucketName, prefix);
  if (result.Contents == null) {
    throw new Error("No files found to delete");
  }

  return await Promise.all(
    result.Contents.map(
      async (item) => await deleteObjectInS3(bucketName, item.Key ?? "")
    )
  );
}

async function copyObject(
  destinationBucketName: string,
  sourceKey: string,
  destinationKey: string
): Promise<CopyObjectCommandOutput> {
  const bucketParams = {
    Bucket: destinationBucketName,
    CopySource: sourceKey,
    Key: destinationKey,
  };

  console.log(bucketParams);
  const response = await s3Client.send(new CopyObjectCommand(bucketParams));
  return response;
}

async function checkIfFileExists(
  bucketName: string,
  key: string
): Promise<boolean> {
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

async function getAllObjectsFromS3(
  bucketName: string,
  prefix: string
): Promise<string[]> {
  const content = [];
  const response = await getS3ItemsList(bucketName, prefix);
  if (response.Contents === undefined) {
    throw new Error("Invalid results");
  } else {
    for (const currentValue of response.Contents) {
      if (currentValue.Size === null || currentValue.Key === undefined) {
        continue;
      }
      const res = await getS3Object(bucketName, currentValue.Key);
      if (res !== undefined) {
        content.push(res);
      }
    }
  }

  return content;
}

interface S3BillingStandardised {
  invoice_receipt_id: string;
  vendor_name: string;
  total: number;
  invoice_receipt_date: string;
  subtotal: number;
  due_date: string;
  tax: number;
  tax_payer_id: string;
  item_id: number;
  item_description: string;
  service_name: string;
  unit_price: number;
  quantity: number;
  price: number;
}

async function s3GetObjectsToArray(
  bucketName: string,
  folderPrefix: string
): Promise<S3BillingStandardised[]> {
  const s3Response = await getAllObjectsFromS3(bucketName, folderPrefix);
  const convertS3Repsonse2Str = JSON.stringify(s3Response);
  const formatS3Str = convertS3Repsonse2Str
    .replace(/:[^"0-9.]*([0-9.]+)/g, ':\\"$1\\"') // converts digits to string for parsing
    .replace(/\\n|'/g, "") // removes //n character , single quotes
    .replace(/}{/g, "},{"); // replace comma in between }{ brackets
  const data = JSON.parse(formatS3Str);
  const s3Array = JSON.parse("[" + String(data["0"]) + "]");
  return s3Array;
}

export {
  getS3ItemsList,
  getS3Object,
  putObjectToS3,
  deleteObjectInS3,
  copyObject,
  checkIfFileExists,
  getAllObjectsFromS3,
  s3GetObjectsToArray,
  deleteDirectoryRecursiveInS3,
};

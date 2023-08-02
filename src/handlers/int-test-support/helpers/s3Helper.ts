import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { runViaLambda } from "./envHelper";
import { s3Client } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";
import { IntTestHelpers } from "../types";
import { callWithRetryAndTimeout } from "./call-wrappers";
import { poll } from "./commonHelpers";
import { decryptKms } from "./kmsHelper";
import crypto from "crypto";

export type S3Object = {
  bucket: string;
  key: string;
};

export type BucketAndPrefix = {
  bucketName: string;
  prefix?: string;
};

type DataAndTarget = {
  data: string;
  target: S3Object;
};

type DeleteS3ObjectsByPrefix = {
  bucket: string;
  prefixes: string[];
};

type DeleteS3Objects = {
  bucket: string;
  keys: string[];
};

type DeletedObject = {
  key?: string;
  versionId?: string;
};

type S3ObjectContent = {
  key?: string;
  size?: number;
  lastModified?: Date;
};

const listS3ObjectsBasic = async (
  params: BucketAndPrefix
): Promise<S3ObjectContent[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.listS3Objects,
      params
    )) as unknown as S3ObjectContent[];

  const objects: S3ObjectContent[] = [];
  let continuationToken: string | undefined;
  do {
    const listParams = {
      Bucket: params.bucketName,
      Prefix: params.prefix,
      ContinuationToken: continuationToken,
    };
    const listResult = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );
    if (listResult.Contents === undefined) {
      return objects;
    }
    for (const content of listResult.Contents) {
      objects.push({
        key: content.Key,
        size: content.Size,
        lastModified: content.LastModified,
      });
    }
    continuationToken = listResult.ContinuationToken;
  } while (continuationToken);
  return objects;
};

export const listS3Objects = callWithRetryAndTimeout(listS3ObjectsBasic);

const getS3ObjectBasic = async (
  object: S3Object
): Promise<string | undefined> => {
  if (runViaLambda())
    return await sendLambdaCommand(IntTestHelpers.getS3Object, object);

  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  try {
    const getObjectResult = await s3Client.send(
      new GetObjectCommand(bucketParams)
    );
    const responseBody = getObjectResult.Body;
    if (responseBody === undefined)
      throw new Error(
        `No data found in ${bucketParams.Bucket}/${bucketParams.Key}`
      );

    const metadata = getObjectResult.Metadata ?? {};

    if (isEncryptedS3ObjectMetadata(metadata)) {
      const responseBodyBytes = await responseBody.transformToByteArray();
      return await getDecrypted(responseBodyBytes, metadata);
    }

    return await responseBody.transformToString();
  } catch (err) {
    if (err instanceof Error) return err.name;
  }
};

// const getS3Object = compose(callWithTimeout(DEFAULT_TIMEOUT), callWithRetry(DEFAULT_RETRIES))(getS3ObjectBasic);

export const getS3Object = callWithRetryAndTimeout(getS3ObjectBasic);

const putS3ObjectBasic = async (
  dataAndTarget: DataAndTarget,
  encoding: BufferEncoding = "ascii" // default encoding ascii
): Promise<void> => {
  if (runViaLambda()) {
    await sendLambdaCommand(IntTestHelpers.putS3Object, dataAndTarget);
    return;
  }

  const bucketParams = {
    Bucket: dataAndTarget.target.bucket,
    Key: dataAndTarget.target.key,
    Body: Buffer.from(dataAndTarget.data, encoding),
  };
  try {
    await s3Client.send(new PutObjectCommand(bucketParams));
  } catch (error) {
    throw new Error(`Failed to put object in S3: ${error}`);
  }
};

export const putS3Object = callWithRetryAndTimeout(putS3ObjectBasic);

const deleteS3ObjectsByPrefixBasic = async (
  params: DeleteS3ObjectsByPrefix
): Promise<DeletedObject[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.deleteS3ObjectsByPrefix,
      params
    )) as unknown as DeletedObject[];
  let result: DeletedObject[] = [];
  for (const prefixToDelete of params.prefixes) {
    const listResult = await listS3Objects({
      bucketName: params.bucket,
      prefix: prefixToDelete,
    });
    if (listResult && listResult.length > 0) {
      const keysToDelete = listResult
        .map(({ key }) => key)
        .filter((key): key is string => key !== undefined);
      result = await deleteS3Objects({
        bucket: params.bucket,
        keys: keysToDelete,
      });
    }
  }
  return result;
};

export const deleteS3ObjectsByPrefix = callWithRetryAndTimeout(
  deleteS3ObjectsByPrefixBasic
);

/* Deletes s3 objects by keys in batches */
const deleteS3ObjectsBasic = async (
  params: DeleteS3Objects
): Promise<DeletedObject[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.deleteS3Objects,
      params
    )) as unknown as DeletedObject[];
  const result: DeletedObject[] = [];
  const batchSize = 1000;
  for (let i = 0; i < params.keys.length; i += batchSize) {
    const batchKeys = params.keys.slice(i, i + batchSize);
    const batchParams = {
      Bucket: params.bucket,
      Delete: {
        Objects: batchKeys.map((Key) => ({ Key })),
        Quiet: false,
      },
    };
    const deleteResult = await s3Client.send(
      new DeleteObjectsCommand(batchParams)
    );
    if (deleteResult.Deleted) {
      result.push(
        ...deleteResult.Deleted.map(({ Key, VersionId }) => ({
          key: Key,
          versionId: VersionId,
        }))
      );
    }
  }
  return result;
};

export const deleteS3Objects = callWithRetryAndTimeout(deleteS3ObjectsBasic);

const copyObjectBasic = async (
  source: S3Object,
  destination: S3Object
): Promise<void> => {
  const bucketParams = {
    Bucket: destination.bucket,
    CopySource: `${source.bucket}/${source.key}`,
    Key: destination.key,
  };
  try {
    await s3Client.send(new CopyObjectCommand(bucketParams));
  } catch (error) {
    throw new Error(`Failed to copy object in S3: ${error}`);
  }
};

export const copyObject = callWithRetryAndTimeout(copyObjectBasic);

const checkIfS3ObjectExistsBasic = async (
  object: S3Object
): Promise<boolean> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.checkIfS3ObjectExists,
      object
    )) as unknown as boolean;

  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  try {
    const data: HeadObjectCommandOutput = await s3Client.send(
      new HeadObjectCommand(bucketParams)
    );
    return data.$metadata.httpStatusCode === 200;
  } catch (err) {
    return false;
  }
};

export const checkIfS3ObjectExists = callWithRetryAndTimeout(
  checkIfS3ObjectExistsBasic
);

export const getS3Objects = async (
  params: BucketAndPrefix,
  lastModifiedAfter?: Date
): Promise<string[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.getS3Objects,
      params
    )) as unknown as string[];

  const content = [];
  const response = await listS3Objects(params);
  if (response === undefined) {
    throw new Error("Invalid results");
  } else {
    for (const currentValue of response) {
      if (currentValue.size === null || currentValue.key === undefined) {
        continue;
      }
      if (
        !lastModifiedAfter ||
        (currentValue.lastModified &&
          currentValue.lastModified > lastModifiedAfter)
      ) {
        const res = await getS3Object({
          bucket: params.bucketName,
          key: currentValue.key,
        });
        if (res !== undefined) {
          content.push(res);
        }
      }
    }
  }
  return content;
};

export interface BillingStandardised {
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

export const getS3ObjectsAsArray = async (
  bucketName: string,
  folderPrefix: string
): Promise<BillingStandardised[]> => {
  const s3Response = await getS3Objects({ bucketName, prefix: folderPrefix });
  const s3String = s3Response.join("").replace(/\n/g, "").replace(/}{/g, "},{");
  return JSON.parse("[" + s3String + "]");
};

export const checkS3BucketForGivenStringExists = async (
  givenString: string,
  timeoutMs: number,
  s3Params: BucketAndPrefix,
  testTime: Date
): Promise<boolean> => {
  const pollS3BucketForGivenString = async (): Promise<boolean> => {
    const objects = await getS3Objects(
      {
        bucketName: s3Params.bucketName,
        prefix: s3Params.prefix,
      },
      testTime
    );
    for (const object of objects) {
      if (object.includes(givenString)) {
        return true;
      }
    }
    return false;
  };
  try {
    const result = await poll(pollS3BucketForGivenString, (result) => result, {
      timeout: timeoutMs,
      notCompleteErrorMessage: `given string does not exist in ${s3Params.bucketName} and ${s3Params.prefix} within the timeout`,
    });
    return result;
  } catch (error) {
    return false;
  }
};

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

type EncryptedS3ObjectMetadata = {
  "x-amz-cek-alg": string;
  "x-amz-iv": string;
  "x-amz-key-v2": string;
  "x-amz-matdesc": string;
  "x-amz-tag-len": string;
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

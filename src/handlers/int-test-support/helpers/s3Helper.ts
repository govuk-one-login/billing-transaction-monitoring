import {
  CopyObjectCommand,
  CopyObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectIdentifier,
  PutObjectCommand,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { runViaLambda } from "./envHelper";
import { s3Client } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";
import { IntTestHelpers } from "../handler";
import { callWithRetryAndTimeout } from "./call-wrappers";

interface S3Object {
  bucket: string;
  key: string;
}

interface BucketAndPrefix {
  bucketName: string;
  prefix?: string;
}

interface DataAndTarget {
  data: ArrayBuffer;
  target: S3Object;
}

interface deleteS3ObjectByKeysParams {
  bucket: string;
  keysToDelete: ObjectIdentifier[];
}

interface deleteS3ObjectByPrefixesParams {
  bucketName: string;
  prefixesToDelete: string[];
}

const listS3ObjectsBasic = async (
  params: BucketAndPrefix
): Promise<ListObjectsV2CommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.listS3Objects,
      params
    )) as unknown as ListObjectsV2CommandOutput;

  const objects: ListObjectsV2CommandOutput = { Contents: [], $metadata: {} };
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
    objects.Contents = objects.Contents?.concat(listResult.Contents);
    continuationToken = listResult.ContinuationToken;
  } while (continuationToken);

  return objects;
};

const listS3Objects = callWithRetryAndTimeout(listS3ObjectsBasic);

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
    return await getObjectResult.Body?.transformToString();
  } catch (err) {
    if (err instanceof Error) return err.name;
  }
};

// const getS3Object = compose(callWithTimeout(DEFAULT_TIMEOUT), callWithRetry(DEFAULT_RETRIES))(getS3ObjectBasic);

const getS3Object = callWithRetryAndTimeout(getS3ObjectBasic);

const putS3ObjectBasic = async (
  dataAndTarget: DataAndTarget
): Promise<PutObjectCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.putS3Object,
      dataAndTarget
    )) as unknown as PutObjectCommandOutput;

  const bucketParams = {
    Bucket: dataAndTarget.target.bucket,
    Key: dataAndTarget.target.key,
    Body: Buffer.from(dataAndTarget.data),
  };
  return await s3Client.send(new PutObjectCommand(bucketParams));
};

const putS3Object = callWithRetryAndTimeout(putS3ObjectBasic);

const deleteS3ObjectsBasic = async (
  params: deleteS3ObjectByPrefixesParams
): Promise<DeleteObjectsCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.deleteS3Objects,
      params
    )) as unknown as DeleteObjectsCommandOutput;
  let result: DeleteObjectsCommandOutput = {
    Deleted: [],
    Errors: [],
    $metadata: {},
  };
  for (const prefixToDelete of params.prefixesToDelete) {
    const listResult = await listS3Objects({
      bucketName: params.bucketName,
      prefix: prefixToDelete,
    });
    if (listResult.Contents && listResult.Contents.length > 0) {
      const keysToDelete = listResult.Contents.map(({ Key }) => ({ Key }));
      result = await deleteS3Object({
        bucket: params.bucketName,
        keysToDelete,
      });
    }
  }
  return result;
};

const deleteS3Objects = callWithRetryAndTimeout(deleteS3ObjectsBasic);

/* Deletes s3 objects by keys in batches */
const deleteS3ObjectBasic = async (
  params: deleteS3ObjectByKeysParams
): Promise<DeleteObjectsCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.deleteS3Object,
      params
    )) as unknown as DeleteObjectsCommandOutput;
  let result: DeleteObjectsCommandOutput = {
    Deleted: [],
    Errors: [],
    $metadata: {},
  };
  const batchSize = 1000;
  for (let i = 0; i < params.keysToDelete.length; i += batchSize) {
    const batchKeys = params.keysToDelete.slice(i, i + batchSize);
    const batchParams = {
      Bucket: params.bucket,
      Delete: {
        Objects: batchKeys,
        Quiet: false,
      },
    };
    result = await s3Client.send(new DeleteObjectsCommand(batchParams));
  }
  return result;
};

const deleteS3Object = callWithRetryAndTimeout(deleteS3ObjectBasic);

const copyObjectBasic = async (
  source: S3Object,
  destination: S3Object
): Promise<CopyObjectCommandOutput> => {
  const bucketParams = {
    Bucket: destination.bucket,
    CopySource: `${source.bucket}/${source.key}`,
    Key: destination.key,
  };

  return await s3Client.send(new CopyObjectCommand(bucketParams));
};

const copyObject = callWithRetryAndTimeout(copyObjectBasic);

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

const checkIfS3ObjectExists = callWithRetryAndTimeout(
  checkIfS3ObjectExistsBasic
);

const getS3Objects = async (params: BucketAndPrefix): Promise<string[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.getS3Objects,
      params
    )) as unknown as string[];

  const content = [];
  const response = await listS3Objects(params);
  if (response.Contents === undefined) {
    throw new Error("Invalid results");
  } else {
    for (const currentValue of response.Contents) {
      if (currentValue.Size === null || currentValue.Key === undefined) {
        continue;
      }
      const res = await getS3Object({
        bucket: params.bucketName,
        key: currentValue.Key,
      });
      if (res !== undefined) {
        content.push(res);
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

const getS3ObjectsAsArray = async (
  bucketName: string,
  folderPrefix: string
): Promise<BillingStandardised[]> => {
  const s3Response = await getS3Objects({ bucketName, prefix: folderPrefix });
  const s3String = s3Response.join("").replace(/\n/g, "").replace(/}{/g, "},{");
  return JSON.parse("[" + s3String + "]");
};

export {
  S3Object,
  listS3Objects,
  getS3Object,
  putS3Object,
  deleteS3Object,
  copyObject,
  deleteS3Objects,
  checkIfS3ObjectExists,
  getS3Objects,
  getS3ObjectsAsArray,
};

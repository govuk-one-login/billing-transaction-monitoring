import {
  CopyObjectCommand,
  CopyObjectCommandOutput,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsV2Command,
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

interface DeleteS3ObjectsByPrefix {
  bucket: string;
  prefixes: string[];
}

interface DeleteS3Objects {
  bucket: string;
  keys: string[];
}

interface S3ObjectContent {
  key?: string;
  size?: number;
  lastModified?: Date;
}

interface DeletedObject {
  key?: string;
  versionId?: string;
}

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
  console.log(objects);
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

const deleteS3ObjectsByPrefix = callWithRetryAndTimeout(
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

const deleteS3Objects = callWithRetryAndTimeout(deleteS3ObjectsBasic);

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
  if (response === undefined) {
    throw new Error("Invalid results");
  } else {
    for (const currentValue of response) {
      if (currentValue.size === null || currentValue.key === undefined) {
        continue;
      }
      const res = await getS3Object({
        bucket: params.bucketName,
        key: currentValue.key,
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
  deleteS3ObjectsByPrefix,
  copyObject,
  deleteS3Objects,
  checkIfS3ObjectExists,
  getS3Objects,
  getS3ObjectsAsArray,
};

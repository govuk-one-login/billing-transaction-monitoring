import {
  CopyObjectCommand,
  CopyObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
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

const listS3ObjectsBasic = async (
  params: BucketAndPrefix
): Promise<ListObjectsCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.listS3Objects,
      params
    )) as unknown as ListObjectsCommandOutput;

  const bucketParams = {
    Bucket: params.bucketName,
    Prefix: params.prefix,
  };
  return await s3Client.send(new ListObjectsCommand(bucketParams));
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

const deleteS3ObjectBasic = async (
  object: S3Object
): Promise<DeleteObjectCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.deleteS3Object,
      object
    )) as unknown as DeleteObjectCommandOutput;

  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  return await s3Client.send(new DeleteObjectCommand(bucketParams));
};

const deleteS3Object = callWithRetryAndTimeout(deleteS3ObjectBasic);

const deleteS3Objects = async (
  params: BucketAndPrefix
): Promise<DeleteObjectCommandOutput[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.deleteS3Objects,
      params
    )) as unknown as DeleteObjectCommandOutput[];

  const result = await listS3Objects(params);

  if (result.Contents === undefined) return [];

  return await Promise.all(
    result.Contents.map(
      async (item) =>
        await deleteS3Object({ bucket: params.bucketName, key: item.Key ?? "" })
    )
  );
};

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

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

const listS3Objects = async (
  params: BucketAndPrefix
): Promise<ListObjectsCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "listS3Objects",
      params
    )) as unknown as ListObjectsCommandOutput;

  const bucketParams = {
    Bucket: params.bucketName,
    Prefix: params.prefix,
  };
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
};

const getS3Object = async (object: S3Object): Promise<string | undefined> => {
  if (runViaLambda()) return await sendLambdaCommand("getS3Object", object);

  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };

  const getObjectResult = await s3Client.send(
    new GetObjectCommand(bucketParams)
  );
  return await getObjectResult.Body?.transformToString();
};

const putS3Object = async (
  dataAndTarget: DataAndTarget
): Promise<PutObjectCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "putS3Object",
      dataAndTarget
    )) as unknown as PutObjectCommandOutput;

  const bucketParams = {
    Bucket: dataAndTarget.target.bucket,
    Key: dataAndTarget.target.key,
    Body: Buffer.from(dataAndTarget.data),
  };
  return await s3Client.send(new PutObjectCommand(bucketParams));
};

const deleteS3Object = async (
  object: S3Object
): Promise<DeleteObjectCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "deleteS3Object",
      object
    )) as unknown as DeleteObjectCommandOutput;

  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  return await s3Client.send(new DeleteObjectCommand(bucketParams));
};

const deleteS3Objects = async (
  params: BucketAndPrefix
): Promise<DeleteObjectCommandOutput[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "deleteS3Objects",
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

const copyObject = async (
  source: S3Object,
  destination: S3Object
): Promise<CopyObjectCommandOutput> => {
  const bucketParams = {
    Bucket: destination.bucket,
    CopySource: `${source.bucket}/${source.key}`,
    Key: destination.key,
  };

  console.log(bucketParams);
  return await s3Client.send(new CopyObjectCommand(bucketParams));
};

const checkIfS3ObjectExists = async (object: S3Object): Promise<boolean> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "checkIfS3ObjectExists",
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
    if (err instanceof Error) console.log(err.name);
    return false;
  }
};

const getS3Objects = async (params: BucketAndPrefix): Promise<string[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "getS3Objects",
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
  const s3Response = await getS3Objects({bucketName, prefix: folderPrefix});
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

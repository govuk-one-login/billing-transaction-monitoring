import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../clients/clients.js";

export type S3Object = {
  bucket: string;
  key: string;
};

export const getS3Object = async (
  object: S3Object
): Promise<string | undefined> => {
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
    return await responseBody.transformToString();
  } catch (err) {
    if (err instanceof Error) return err.name;
  }
};

type DataAndTarget = {
  data: string;
  target: S3Object;
};

export const putS3Object = async (
  dataAndTarget: DataAndTarget
): Promise<void> => {
  const bucketParams = {
    Bucket: dataAndTarget.target.bucket,
    Key: dataAndTarget.target.key,
    Body: Buffer.from(dataAndTarget.data, "ascii"),
  };
  try {
    await s3Client.send(new PutObjectCommand(bucketParams));
  } catch (error) {
    throw new Error(`Failed to put object in S3: ${error}`);
  }
};

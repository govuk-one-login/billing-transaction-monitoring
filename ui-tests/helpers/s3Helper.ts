import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../clients/clients.js";

export type S3Object = {
  bucket: string;
  key: string;
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

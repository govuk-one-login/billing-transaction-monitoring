import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "@aws-sdk/client-s3";
import type { Command, SmithyConfiguration } from "@aws-sdk/smithy-client";

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

export async function moveS3(
  bucket: string,
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  const copyCommand = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: destinationKey,
  });

  await send(copyCommand);

  await deleteS3(bucket, sourceKey);
}

export async function putS3(
  bucket: string,
  key: string,
  item: Object
): Promise<void> {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(item),
  });

  await send(putCommand);
}

const send = async <T extends ServiceInputTypes, U extends ServiceOutputTypes>(
  command: Command<T, U, SmithyConfiguration<{}>>
): Promise<void> =>
  await s3
    .send(command)
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err, err.stack);
      throw err;
    });

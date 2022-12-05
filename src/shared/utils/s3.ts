import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

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

const send = async (
  command: DeleteObjectCommand | PutObjectCommand
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

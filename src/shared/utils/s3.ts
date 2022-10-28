import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});

export async function deleteS3(bucket: string, key: string) {
  let deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return send(deleteCommand);
}

export async function putS3(bucket: string, key: string, item: Object) {
  let putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(item),
  });

  return send(putCommand);
}

const send = async (command: DeleteObjectCommand | PutObjectCommand) =>
  s3
    .send(command)
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err, err.stack);
      throw err;
    });

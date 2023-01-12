import { S3Event } from "aws-lambda";
import * as AWS from "aws-sdk";
import csv from "csvtojson";

export const handler = async (event: S3Event): Promise<void> => {
  const S3 = new AWS.S3();

  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  };

  console.log("** params:", params);

  const stream = S3.getObject(params).createReadStream();

  const json = await csv().fromStream(stream);
  console.log(json);
};

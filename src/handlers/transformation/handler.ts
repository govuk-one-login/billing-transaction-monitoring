import { S3Event } from "aws-lambda";
import * as AWS from "aws-sdk";
import csv from "csvtojson";

export const handler = async (event: S3Event): Promise<void> => {

  const details = event.Records[0].s3;

  const params = { Bucket: details.bucket.name, Key: details.object.key };

  const S3 = new AWS.S3();
  const stream = S3.getObject(params).createReadStream();

  const json = await csv().fromStream(stream);
  console.log(json);

};

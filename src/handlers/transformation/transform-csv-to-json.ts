import { S3Event } from "aws-lambda";
import * as AWS from "aws-sdk";
import csv from "csvtojson";

// Unsure how to test this function or indeed if it even needs testing given that it basically just using S3 and the csvtojson library. Feedback/Help welcome!
export async function transformCsvToJson(event: S3Event): Promise<any[]> {
  const S3 = new AWS.S3();
  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  };
  const stream = S3.getObject(params).createReadStream();
  const rows = await csv().fromStream(stream);
  return rows;
}

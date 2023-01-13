import { S3Event } from "aws-lambda";
import * as AWS from "aws-sdk";
import csv from "csvtojson";
import { sendRecord } from "../../shared/utils";

interface TransformationEventBodyObject {
  event_id: string;
  timestamp: number;
  timestamp_formatted: string;
  event_name: string;
  component_id: string;
  client_id: string;
}

export const handler = async (event: S3Event): Promise<void> => {
  const rows = await transformCsvToJson(event);

  const promises = rows.map(async (row) => {
    await transformRow(row);
  });
  await Promise.all(promises);
};

async function transformCsvToJson(event: S3Event): Promise<any[]> {
  const S3 = new AWS.S3();
  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  };
  const stream = S3.getObject(params).createReadStream();
  const rows = await csv().fromStream(stream);
  console.log("transformCsvToJson rows", rows);
  return rows;
}

async function transformRow(row: any): Promise<void> {
  if (
    process.env.OUTPUT_QUEUE_URL === undefined ||
    process.env.OUTPUT_QUEUE_URL.length === 0
  ) {
    const message = "Output queue URL not set.";
    console.error(message);
    throw new Error(message);
  }

  console.log(typeof row);

  const idpEntityId = row["Idp Entity Id"];
  const requestId = row["Request Id"];
  const timestamp = 1671117135;
  const timestampFormatted = row.Timestamp;
  const rpEntityId = row["RP Entity Id"];

  const transformationEventBodyObject: TransformationEventBodyObject = {
    event_id: requestId,
    timestamp,
    timestamp_formatted: timestampFormatted,
    event_name: "NEW_EVENT_NAME",
    component_id: rpEntityId,
    client_id: idpEntityId,
  };

  await sendRecord(
    process.env.OUTPUT_QUEUE_URL,
    JSON.stringify(transformationEventBodyObject)
  );
}

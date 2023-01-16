import { S3Event } from "aws-lambda";
import * as AWS from "aws-sdk";
import csv from "csvtojson";
import { sendRecord } from "../../shared/utils";
import { getS3Object } from "../../../integration_tests/helpers/s3Helper";
import { configStackName } from "../../../integration_tests/helpers/envHelper";

interface TransformationEventBodyObject {
  event_id: string;
  timestamp: number;
  timestamp_formatted: string;
  event_name: string;
  component_id: string;
  client_id: string;
}

export const handler = async (event: S3Event): Promise<void> => {
  const mappedIdpClients = await getS3Object({
    bucket: configStackName(),
    key: "idp_clients/idp-clients.json",
  });

  if (mappedIdpClients !== undefined) {
    const idpClientLookup = JSON.parse(mappedIdpClients);
    const rows = await transformCsvToJson(event);

    const promises = rows.map(async (row) => {
      await transformRow(row, idpClientLookup);
    });
    await Promise.all(promises);
  }
};

async function transformCsvToJson(event: S3Event): Promise<any[]> {
  const S3 = new AWS.S3();
  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  };
  const stream = S3.getObject(params).createReadStream();
  const rows = await csv().fromStream(stream);
  return rows;
}

async function transformRow(
  row: any,
  idpClientLookup: { [index: string]: string }
): Promise<void> {
  if (
    process.env.OUTPUT_QUEUE_URL === undefined ||
    process.env.OUTPUT_QUEUE_URL.length === 0
  ) {
    const message = "Output queue URL not set.";
    console.error(message);
    throw new Error(message);
  }

  const idpEntityId = row["Idp Entity Id"];
  const requestId = row["Request Id"];
  const timestampFormatted = row.Timestamp;
  const timestamp = Math.floor(Date.parse(timestampFormatted) / 1000);
  const rpEntityId = row["RP Entity Id"];

  const transformationEventBodyObject: TransformationEventBodyObject = {
    event_id: requestId,
    timestamp,
    timestamp_formatted: timestampFormatted,
    event_name: "NEW_EVENT_NAME",
    component_id: rpEntityId,
    client_id: idpClientLookup[idpEntityId],
  };

  await sendRecord(
    process.env.OUTPUT_QUEUE_URL,
    JSON.stringify(transformationEventBodyObject)
  );
}

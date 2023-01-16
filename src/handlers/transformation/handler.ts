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

  const mappedEventNames = await getS3Object({
    bucket: configStackName(),
    key: "idp_event_name_rules/idp-event-name-rules.json",
  });

  if (mappedIdpClients !== undefined && mappedEventNames !== undefined) {
    const idpClientLookup = JSON.parse(mappedIdpClients);
    const eventNameRules = JSON.parse(mappedEventNames);
    const rows = await transformCsvToJson(event);

    const promises = rows.map(async (row) => {
      await transformRow(row, idpClientLookup, eventNameRules);
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
  idpClientLookup: { [index: string]: string },
  eventNameRules: EventNameRules
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
  const minLevelOfAssurance = row["Minimum Level Of Assurance"];
  const billableStatus = row["Billable Status"];

  const transformationEventBodyObject: TransformationEventBodyObject = {
    event_id: requestId,
    timestamp,
    timestamp_formatted: timestampFormatted,
    event_name: await buildEventName(
      eventNameRules,
      idpEntityId,
      minLevelOfAssurance,
      billableStatus
    ),
    component_id: rpEntityId,
    client_id: idpClientLookup[idpEntityId],
  };

  await sendRecord(
    process.env.OUTPUT_QUEUE_URL,
    JSON.stringify(transformationEventBodyObject)
  );
}

interface Rules {
  "Minimum Level Of Assurance": string;
  "Billable Status": string;
  "Event Name": string;
}

interface EventNameRules {
  [key: string]: Rules[];
}

async function buildEventName(
  eventNameRules: EventNameRules,
  idpEntityId: string,
  minLevelOfAssurance: string,
  billableStatus: string
): Promise<string> {
  const rules = eventNameRules[idpEntityId];

  for (const rule of rules) {
    if (
      minLevelOfAssurance === rule["Minimum Level Of Assurance"] &&
      billableStatus === rule["Billable Status"]
    ) {
      return rule["Event Name"];
    }
  }
  return "unknown";
}

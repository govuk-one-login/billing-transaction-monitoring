import { S3Event } from "aws-lambda";
import { readJsonFromS3 } from "../../shared/utils";

import { transformCsvToJson } from "./transform-csv-to-json";
import { processRow } from "./process-row";

export const handler = async (event: S3Event): Promise<void> => {
  console.log("**event=", event);
  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;
  const configBucket = process.env.CONFIG_BUCKET;

  if (outputQueueUrl === undefined || outputQueueUrl.length === 0) {
    throw new Error("Output queue URL not set.");
  }

  if (configBucket === undefined || configBucket.length === 0) {
    throw new Error("Config Bucket not set.");
  }

  try {
    // Set up dependencies

    const idpClientLookup = await readJsonFromS3(
      configBucket,
      "idp_clients/idp-clients.json"
    );
    console.log("**idpClientLookup=", idpClientLookup);

    const eventNameRules = await readJsonFromS3(
      configBucket,
      "idp_event_name_rules/idp-event-name-rules.json"
    );
    console.log("**eventNameRules=", eventNameRules);
    const rows = await transformCsvToJson(event);
    console.log("**rows=", rows);

    // Transform data and send to SQS

    const promises = rows.map(async (row) => {
      await processRow(row, idpClientLookup, eventNameRules, outputQueueUrl);
    });

    // TO DO: Look into using Promise.allSettled
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
    throw new Error("Transformation Handler error");
  }
};

import { S3Event } from "aws-lambda";
import { readJsonFromS3 } from "../../shared/utils";
import { configStackName } from "../int-test-support/helpers/envHelper";

import { transformCsvToJson } from "./transform-csv-to-json";
import { processRow } from "./process-row";

export const handler = async (event: S3Event): Promise<void> => {
  console.log("**event=", event);
  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;

  if (outputQueueUrl === undefined || outputQueueUrl.length === 0) {
    throw new Error("Output queue URL not set.");
  }
  console.log("**outputQueueUrl=", outputQueueUrl);

  try {
    // Set up dependencies

    const idpClientLookup = await readJsonFromS3(
      configStackName(),
      "idp_clients/idp-clients.json"
    );
    console.log("**idpClientLookup=", idpClientLookup);

    const eventNameRules = await readJsonFromS3(
      configStackName(),
      "idp_event_name_rules/idp-event-name-rules.json"
    );
    console.log("**eventNameRules=", eventNameRules);
    const rows = await transformCsvToJson(event);
    console.log("**rows=", rows);

    // Transform data and send to SQS

    const promises = rows.map(async (row) => {
      await processRow(row, idpClientLookup, eventNameRules, outputQueueUrl);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error(error);
    throw new Error("Transformation Handler error");
  }
};

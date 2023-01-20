import { S3Event } from "aws-lambda";
import { readJsonFromS3 } from "../../shared/utils";
import { configStackName } from "../../../integration_tests/helpers/envHelper";
import { transformCsvToJson } from "./transform-csv-to-json";
import { transformRow } from "./transform-row";

export const handler = async (event: S3Event): Promise<void> => {
  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;

  if (outputQueueUrl === undefined || outputQueueUrl.length === 0) {
    throw new Error("Output queue URL not set.");
  }

  try {
    // Set up dependencies

    const idpClientLookup = await readJsonFromS3(
      configStackName(),
      "idp_clients/idp-clients.json"
    );

    const eventNameRules = await readJsonFromS3(
      configStackName(),
      "idp_event_name_rules/idp-event-name-rules.json"
    );

    const rows = await transformCsvToJson(event);

    // Transform data and send to SQS

    const promises = rows.map(async (row) => {
      await transformRow(row, idpClientLookup, eventNameRules, outputQueueUrl);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error(error);
    throw new Error("Transformation Handler error");
  }
};

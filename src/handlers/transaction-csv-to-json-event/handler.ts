import { S3Event } from "aws-lambda";
import { fetchS3 } from "../../shared/utils";

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

    const [idpClientLookup, eventNameRules] = await Promise.all([
      fetchS3(configBucket, "idp_clients/idp-clients.json"),
      fetchS3(configBucket, "idp_event_name_rules/idp-event-name-rules.json"),
    ]).then((results) => results.map((result) => JSON.parse(result)));

    const rows = await transformCsvToJson(event);
    console.log("**rows=", rows);

    // Transform data and send to SQS

    const promises = rows.map(async (row) => {
      await processRow(row, idpClientLookup, eventNameRules, outputQueueUrl);
    });

    const results = await Promise.allSettled(promises);
    if (results.some((result) => result.status === "rejected")) {
      console.error(
        `Failed to process all rows: ${
          results.filter((result) => result.status === "rejected").length
        } out of ${results.length} failed`
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("Transaction CSV to Json Event Handler error");
  }
};

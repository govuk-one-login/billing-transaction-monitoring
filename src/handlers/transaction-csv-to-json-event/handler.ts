import { S3Event } from "aws-lambda";
import { fetchS3, sendRecord } from "../../shared/utils";

import { transformCsvToJson } from "./transform-csv-to-json";
import { processRow } from "./process-row";
import { getEventNameFromRules } from "./get-event-name-from-rules";

export const handler = async (event: S3Event): Promise<void> => {
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

    const [idpVendorLookup, eventNameRules] = await Promise.all([
      fetchS3(configBucket, "idp_vendors/idp-vendors.json"),
      fetchS3(configBucket, "idp_event_name_rules/idp-event-name-rules.json"),
    ]).then((results) => results.map((result) => JSON.parse(result)));

    const source = await transformCsvToJson(event);

    // Transform data and send to SQS
    const promises = source.reduce<Array<Promise<void>>>((accumulator, row) => {
      const isInvalidEvent =
        getEventNameFromRules(eventNameRules, row["Idp Entity Id"], row) ===
        "Unknown";
      if (isInvalidEvent) return accumulator;
      const transactionEvent = processRow(row, idpVendorLookup, eventNameRules);
      return [
        ...accumulator,
        sendRecord(outputQueueUrl, JSON.stringify(transactionEvent)),
      ];
    }, []);

    const results = await Promise.allSettled(promises);
    if (results.some((result) => result.status === "rejected")) {
      throw new Error(
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

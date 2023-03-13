/* eslint-disable @typescript-eslint/naming-convention */
import { S3Event } from "aws-lambda";
import { fetchS3, logger, sendRecord } from "../../shared/utils";
import { convert } from "./convert";
import { isValidRenamingConfig } from "./convert/csv-to-json";
import { isValidInferencesConfig } from "./convert/make-inferences";
import { isValidTransformationsConfig } from "./convert/perform-transformations";

export const handler = async (event: S3Event): Promise<void> => {
  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;
  const configBucket = process.env.CONFIG_BUCKET;

  if (outputQueueUrl === undefined || outputQueueUrl.length === 0) {
    throw new Error("Output queue URL not set.");
  }

  if (configBucket === undefined || configBucket.length === 0) {
    throw new Error("Config Bucket not set.");
  }

  const [renamingMap, inferences, transformations] = await Promise.all([
    fetchS3(configBucket, "csv_transactions/header-row-renaming-map.json"),
    fetchS3(configBucket, "csv_transactions/event-inferences.json"),
    fetchS3(configBucket, "csv_transactions/event-transformation.json"),
  ]).then((results) =>
    results.map((result) => {
      try {
        return JSON.parse(result);
      } catch (error) {
        throw new Error(`Config JSON could not be parsed. Received ${result}`);
      }
    })
  );

  if (!isValidRenamingConfig(renamingMap)) {
    logger.error(
      `header-row-renaming-map.json is invalid.  Received ${renamingMap}`
    );
    throw new Error(
      `header-row-renaming-map.json is invalid.  Received ${renamingMap}`
    );
  }

  if (!isValidInferencesConfig(inferences)) {
    logger.error(`event-inferences.json is invalid. Received ${inferences}`);
    throw new Error(`event-inferences.json is invalid. Received ${inferences}`);
  }

  if (!isValidTransformationsConfig(transformations)) {
    logger.error(
      `event-transformation.json is invalid. Received ${transformations}`
    );
    throw new Error(
      `event-transformation.json is invalid. Received ${transformations}`
    );
  }

  const csv = await fetchS3(
    event.Records[0].s3.bucket.name,
    event.Records[0].s3.object.key
  ); // should we we getting all the records or is the zeroth one ok?

  const transactions = await convert(csv, {
    renamingMap,
    inferences,
    transformations,
  });

  const sendRecordPromises = transactions
    .filter(({ event_name }) => event_name !== "Unknown")
    .map(
      async (transaction) =>
        await sendRecord(outputQueueUrl, JSON.stringify(transaction), {
          shouldLog: false,
        })
    );

  const results = await Promise.allSettled(sendRecordPromises);
  for (const result of results) {
    if (result.status === "rejected")
      throw new Error(
        `Failed to process all rows: ${
          results.filter((result) => result.status === "rejected").length
        } out of ${results.length} failed`
      );
  }
};

import { S3Event } from "aws-lambda";
import { fetchS3, sendRecord } from "../../shared/utils";
import { convert } from "./convert";

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
    const [csv, renamingMap, inferences, transformations] = await Promise.all([
      fetchS3(event.Records[0].s3.bucket.name, event.Records[0].s3.object.key), // should we we getting all the records or is the zeroth one ok?
      fetchS3(configBucket, "csv_transactions/renaming-map.json"),
      fetchS3(configBucket, "csv_transactions/inferences.json"),
      fetchS3(configBucket, "csv_transactions/transformations.json"),
    ]).then((results) => results.map((result) => JSON.parse(result)));

    const transactions = await convert(csv, {
      renamingMap,
      inferences,
      transformations,
    });

    const sendRecordPromises = transactions.map(
      async (transaction) =>
        await sendRecord(outputQueueUrl, JSON.stringify(transaction))
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
  } catch (error) {
    console.error(error);
    throw new Error("Transaction CSV to Json Event Handler error");
  }
};

import { SQSEvent } from "aws-lambda";
import {getS3EventRecordsFromSqs} from "../../shared/utils";
import { fetchS3 } from "../s3";
import {Response} from "../../shared/types";
import {VENDOR_SERVICE_CONFIG_PATH} from "../../shared/constants";

export const handler = async (event: SQSEvent): Promise<Response> => {

  console.log(event.Records[0].body);

  const configBucket = process.env.CONFIG_BUCKET;

  if (configBucket === undefined || configBucket.length === 0) {
    throw new Error("Config Bucket not set.");
  }

  const destinationBucket = process.env.DESTINATION_BUCKET;

  if (destinationBucket === undefined || destinationBucket.length === 0) {
    throw new Error("Destination bucket not set.");
  }

  const response: Response = {
    batchItemFailures: [],
  };

  const promises = event.Records.map(async (record) => {
    try {
      const storageRecords = getS3EventRecordsFromSqs(record);

      for (const record of storageRecords) {
        const bucket = record.s3.bucket.name;
        const filePath = record.s3.object.key;

        // File must be in folder, which determines vendor ID. Throw error otherwise.
        const filePathParts = filePath.split("/");
        if (filePathParts.length < 2) {
          throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);
        }

        const invoiceCsvText = await fetchS3(bucket, filePath);

        if (invoiceCsvText === "") {
          throw new Error("Error reading invoice CSV");
        }

        // TODO finish
      }
    } catch (e) {
      console.log(e);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

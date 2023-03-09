import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { fetchS3, getS3EventRecordsFromSqs } from "../../shared/utils";
import { parseCsv } from "./parsing-utils/parse-csv";

// TODO
// 1. Set up the dependencies
// 2. Write handler function to loop through each record, extract the bucket/file name, handle errors.
// 3. Add the fetchS3 function
// 3a. Add the parseCsv function
// 4. Write the handler 'getCsvStandardised' function that will standardise the invoice
// 5. Add the 'putTextS3' function that will put the invoice data into the storage bucket (.txt)
// 5. Handle errors with batchItemFailures

export const handler = async (event: SQSEvent): Promise<Response> => {
  console.log("incoming event", event);

  const destinationBucket = process.env.DESTINATION_BUCKET;
  if (destinationBucket === undefined || destinationBucket.length === 0) {
    throw new Error("Destination bucket not set.");
  }

  const destinationFolder = process.env.DESTINATION_FOLDER;
  if (destinationFolder === undefined || destinationFolder.length === 0) {
    throw new Error("Destination folder not set.");
  }

  const response: Response = {
    batchItemFailures: [],
  };

  const promises = event.Records.map(async (record) => {
    try {
      console.log("record", record);
      const eventRecords = getS3EventRecordsFromSqs(record);
      console.log("eventRecords", eventRecords);
      for (const record of eventRecords) {
        const bucket = record.s3.bucket.name;
        const filePath = record.s3.object.key;

        // File must be in folder, which determines vendor ID. Throw error otherwise.
        const filePathParts = filePath.split("/");
        if (filePathParts.length < 2)
          throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);

        const csv = await fetchS3(bucket, filePath);
        const parsedCsv = parseCsv(csv);
        console.log(parsedCsv);
      }
    } catch (error) {
      console.log(error);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  // TODO Look into promise.allSettled

  return response;
};

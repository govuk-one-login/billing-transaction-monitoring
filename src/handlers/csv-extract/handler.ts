import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { getS3EventRecordsFromSqs } from "../../shared/utils";

// TODO
// 1. Set up the dependencies
// 2. Write handler function to loop through each record, extract the bucket/file name.
// 3. Write the handler 'fetch' function that will take the bucket/file name and retrieve the csv, parse it and check the structure is as expected.
// 3.a. ** Explore if there is a library that returns an instance of a class that has all the csv data
// 4. Write the 'standardise' function that will convert the csv data to invoice data
// 5. Write the handler 'store' function that will put the invoice data into the storage bucket
// 6. Handle errors with batchItemFailures

export const handler = async (event: SQSEvent): Promise<Response> => {
  console.log(event);

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
      const csvRecords = getS3EventRecordsFromSqs(record);
      console.log(csvRecords);
    } catch (error) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  // TODO Look into promise.allSettled

  // const promises = event.Records.map(async (record) => {
  //   try {
  //     const storageRecords = getS3EventRecordsFromSqs(record);

  //     for (const record of storageRecords) {
  //       const bucket = record.s3.bucket.name;
  //       const filePath = record.s3.object.key;

  //       // File must be in folder, which determines vendor ID. Throw error otherwise.
  //       const filePathParts = filePath.split("/");
  //       if (filePathParts.length < 2) {
  //         throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);
  //       }

  //       const invoiceCsvText = await fetchS3(bucket, filePath);

  //       if (invoiceCsvText === "") {
  //         throw new Error("Error reading invoice CSV");
  //       }

  //       // TODO finish
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     response.batchItemFailures.push({ itemIdentifier: record.messageId });
  //   }
  // });

  // await Promise.all(promises);
  return response;
};

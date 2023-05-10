import { SQSEvent } from "aws-lambda";
import { getS3EventRecordsFromSqs, logger } from "../../shared/utils";
import { Response } from "../../shared/types";

export const handler = async (event: SQSEvent): Promise<Response> => {
  // Set Up
  const destinationBucket = process.env.DESTINATION_BUCKET;
  if (destinationBucket === undefined || destinationBucket.length === 0)
    throw new Error("Destination bucket not set.");

  const response: Response = {
    batchItemFailures: [],
  };

  const promises = event.Records.map(async (record) => {
    try {
      const emailRecords = getS3EventRecordsFromSqs(record);

      const recordPromises = emailRecords.map(async (emailRecord) => {
        const bucket = emailRecord.s3.bucket.name;
        const filePath = emailRecord.s3.object.key;

        // File must be in a vendor ID folder in the Raw Email bucket, which determines folder for the Raw Invoice bucket. Throw error otherwise.
        const filePathParts = filePath.split("/");
        if (filePathParts.length < 2)
          throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);

        const vendorId = filePathParts[0];
        const sourceFileName = filePathParts[filePathParts.length - 1];
        logger.info(`Vendor: ${vendorId}`); // To be deleted
        logger.info(`File name: ${sourceFileName}`); // To be deleted

        // Extract attachments from the email
        // Filter attachments that are pdf or csv
        // Upload attachments to Raw Invoice S3 bucket
      });
      await Promise.all(recordPromises);
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

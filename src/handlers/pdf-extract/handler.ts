import * as AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import {
  getFromEnv,
  getS3EventRecordsFromSqs,
  logger,
} from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<Response> => {
  // Set Up
  const textExtractRole = getFromEnv("TEXTRACT_ROLE");
  const snsTopic = getFromEnv("TEXTRACT_SNS_TOPIC");

  if (textExtractRole === undefined || textExtractRole === "") {
    throw new Error("Textract role not set.");
  }
  if (snsTopic === undefined || snsTopic === "") {
    throw new Error("SNS Topic not set.");
  }

  const textract = new AWS.Textract({ region: "eu-west-2" });
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
        if (filePathParts.length < 2)
          throw Error(`File not in vendor ID folder: ${bucket}/${filePath}`);

        // Define params for Textract API call
        const params: AWS.Textract.StartExpenseAnalysisRequest = {
          DocumentLocation: {
            S3Object: {
              Bucket: bucket,
              Name: filePath,
            },
          },
          NotificationChannel: {
            RoleArn: textExtractRole,
            SNSTopicArn: snsTopic,
          },
        };
        // Invoke textract function
        const textractResponse = await textract
          .startExpenseAnalysis(params)
          .promise();
        if (textractResponse.JobId === undefined) {
          throw new Error("Textract error");
        }
      }
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

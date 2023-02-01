import * as AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { getS3EventRecordsFromSqs } from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<Response> => {
  // Set Up
  const textExtractRole = process.env.TEXTRACT_ROLE;
  const snsTopic = process.env.TEXTRACT_SNS_TOPIC;

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
      console.log("Event body:", record.body);

      const storageRecords = getS3EventRecordsFromSqs(record);

      for (const record of storageRecords) {
        const bucket = record.s3.bucket.name;
        const filePath = record.s3.object.key;

        // File must be in folder, which determines client ID. Throw error otherwise.
        const filePathParts = filePath.split("/");
        if (filePathParts.length < 2)
          throw Error(`File not in client ID folder: ${bucket}/${filePath}`);

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
        console.log("File path:", filePath);
        console.log("Job ID:", textractResponse.JobId);
      }
    } catch (e) {
      console.log(e);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

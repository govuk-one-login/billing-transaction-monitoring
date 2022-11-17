import * as AWS from "aws-sdk";
import {
  TextractClient,
  StartExpenseAnalysisCommand,
  StartExpenseAnalysisResponse,
} from "@aws-sdk/client-textract";
import { S3EventRecord, SQSEvent } from "aws-lambda";

export const handler = async (
  event: SQSEvent
): Promise<StartExpenseAnalysisResponse> => {
  // Set up
  const textract = new TextractClient({ region: "eu-west-2" });

  // Get Bucket and filename from the event.
  const s3Event = JSON.parse(event.Records[0].body) as S3EventRecord;

  const bucket = s3Event.s3.bucket.name;
  const fileName = s3Event.s3.object.key;

  // Logs fileName
  console.log("File Name: " + fileName);

  // Define params for Textract API call
  const params: AWS.Textract.StartExpenseAnalysisRequest = {
    DocumentLocation: {
      S3Object: {
        Bucket: bucket,
        Name: fileName,
      },
    },
    NotificationChannel: {
      RoleArn: process.env.TEXT_EXTRACT_ROLE!,
      SNSTopicArn: process.env.SNS_TOPIC!,
    },
  };
  console.log("*** params", params);
  // Invoke textract function
  const response = await textract.send(new StartExpenseAnalysisCommand(params));
  console.log("JobId :", response.JobId);
  return { JobId: response.JobId };
};

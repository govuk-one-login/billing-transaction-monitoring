import {
  TextractClient,
  StartExpenseAnalysisCommand,
  StartExpenseAnalysisResponse,
} from "@aws-sdk/client-textract";
import { S3Event, SQSEvent } from "aws-lambda";

export const handler = async (
  event: SQSEvent
): Promise<StartExpenseAnalysisResponse> => {
  // Set up
  const textract = new TextractClient({});

  // Get Bucket and filename from the event.
  const s3Event = JSON.parse(event.Records[0].body) as S3Event;
  const bucket = s3Event.Records[0].s3.bucket.name;
  const fileName = s3Event.Records[0].s3.object.key;

  // Logs fileName
  console.log("File Name: " + fileName);

  // Define params for Textract API call
  const params = {
    DocumentLocation: {
      S3Object: {
        Bucket: bucket,
        Name: fileName,
      },
    },
    NotificationChannel: {
      RoleArn: process.env.TEXT_EXTRACT_ROLE,
      SNSTopicArn: process.env.SNS_TOPIC,
    },
  };

  // Invoke textract function
  const response = await textract.send(new StartExpenseAnalysisCommand(params));
  console.log("JobId :", response.JobId);
  return { JobId: response.JobId };
};

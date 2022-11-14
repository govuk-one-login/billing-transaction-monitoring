import {
  TextractClient,
  StartExpenseAnalysisCommand,
  Textract,
} from "@aws-sdk/client-textract";
import { S3Event, SQSEvent } from "aws-lambda";

interface Response {
  JobId: "string";
}

// Event should be SQSEvent? How to extract bucket name/filename?

export const handler = async (event: S3Event): Promise<Response> => {
  // Set up
  const textract = new TextractClient({});

  // Get Bucket and filename from the event
  const bucket = event.Records[0].s3.bucket.name;
  const fileName = event.Records[0].s3.object.key;

  // Throw error if filename isn't defined
  if (!fileName) {
    throw new Error("ERROR - no filename found in S3 event");
  }

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
  try {
    const response = await textract.send(
      new StartExpenseAnalysisCommand(params)
    );

    return { JobId: response.JobId };
  } catch (err) {
    console.log(err);
  }
};

import * as AWS from "aws-sdk";
import { S3Event } from "aws-lambda";

export const handler = async (
  event: S3Event
): Promise<AWS.Textract.StartExpenseAnalysisResponse[]> => {
  const textExtractRole = process.env.TEXT_EXTRACT_ROLE;
  const snsTopic = process.env.SNS_TOPIC;

  if (textExtractRole === undefined || textExtractRole === "") {
    const textractMessage = "Textract role not set.";
    throw new Error(textractMessage);
  }
  if (snsTopic === undefined || snsTopic === "") {
    const snsMessage = "SNS Topic not set.";
    throw new Error(snsMessage);
  }
  // Set up
  const textract = new AWS.Textract({ region: "eu-west-2" });
  const response: AWS.Textract.StartExpenseAnalysisResponse[] = [];

  // Get Bucket and filename from the event.
  const promises = event.Records.map(async (record) => {
    console.log(`Record ${JSON.stringify(record)}`);
    const bucket = record.s3.bucket.name;
    const fileName = record.s3.object.key;
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
        RoleArn: textExtractRole,
        SNSTopicArn: snsTopic,
      },
    };

    // Invoke textract function
    response.push(await textract.startExpenseAnalysis(params).promise());
  });

  await Promise.all(promises);
  return response;
};

import * as AWS from "aws-sdk";
import { S3Event } from "aws-lambda";

export const handler = async (
  event: S3Event
): Promise<AWS.Textract.StartExpenseAnalysisResponse[]> => {
  // Set up
  const textract = new AWS.Textract({ region: "eu-west-2" });
  console.log("Event", event);
  const response: AWS.Textract.StartExpenseAnalysisResponse[] = [];
  // Get Bucket and filename from the event.
  const promises = event.Records.map(async (record) => {
    console.log(`Record ${JSON.stringify(record)}`);
    const bucket = record.s3.bucket.name;
    const fileName = record.s3.object.key;
    console.log("File Name: " + fileName);

    try {
      if (process.env.TEXT_EXTRACT_ROLE === undefined) {
        const textractMessage = "Textract role not set.";
        console.error(textractMessage);
        throw new Error(textractMessage);
      }
      if (process.env.SNS_TOPIC === undefined) {
        const snsMessage = "SNS Topic not set.";
        console.error(snsMessage);
        throw new Error(snsMessage);
      }

      // Define params for Textract API call
      const params: AWS.Textract.StartExpenseAnalysisRequest = {
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
      console.log("Params for textract call", params);

      // Invoke textract function
      response.push(await textract.startExpenseAnalysis(params).promise());
    } catch (err) {
      throw new Error("Textract API Call failure");
    }
  });

  await Promise.all(promises);
  return response;
};

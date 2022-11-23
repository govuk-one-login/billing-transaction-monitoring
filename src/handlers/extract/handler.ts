import * as AWS from "aws-sdk";
import { S3Event, SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";

export const handler = async (event: SQSEvent): Promise<Response> => {
  // Set Up
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

  const textract = new AWS.Textract({ region: "eu-west-2" });
  const response: Response = {
    batchItemFailures: [],
  };

  // Get Bucket and filename from the event.
  const promises = event.Records.map(async (record) => {
    const bodyObject = JSON.parse(record.body) as S3Event;
    console.log("S3 Record: ", bodyObject);
    const bucket = bodyObject.Records[0].s3.bucket.name;
    const fileName = bodyObject.Records[0].s3.object.key;

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
    try {
      const textractResponse = await textract
        .startExpenseAnalysis(params)
        .promise();
      if (textractResponse.JobId === undefined) {
        throw new Error("Textract error");
      }
      console.log("Filename:", fileName);
      console.log("Job ID:", textractResponse.JobId);
    } catch (e) {
      console.log(e);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

import * as AWS from "aws-sdk";
import { S3Event, SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";

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
      const bodyObject = JSON.parse(record.body);
      // Get Bucket and filename from the event.
      if (typeof bodyObject !== "object")
        throw new Error("Event record body not an object.");

      if (!isS3Event(bodyObject))
        throw new Error("Event record body not valid S3 event.");

      for (const record of bodyObject.Records) {
        const bucket = record.s3.bucket.name;
        const fileName = record.s3.object.key;

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
        const textractResponse = await textract
          .startExpenseAnalysis(params)
          .promise();
        if (textractResponse.JobId === undefined) {
          throw new Error("Textract error");
        }
        console.log("Filename:", fileName);
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

const isS3Event = (object: any): object is S3Event =>
  Array.isArray(object.Records) &&
  object.Records.every(
    (record: any) =>
      typeof record?.s3?.bucket?.name === "string" &&
      typeof record?.s3?.object?.key === "string"
  );

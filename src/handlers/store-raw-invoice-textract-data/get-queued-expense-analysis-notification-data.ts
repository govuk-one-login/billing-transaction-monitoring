import { SQSRecord } from "aws-lambda";
import { ValidTextractJobStatus } from "../../shared/types";
import { isValidTextractJobStatus } from "./is-valid-textract-job-status";

interface ExpenseAnalysisNotificationData {
  jobId: string;
  sourceBucket: string;
  sourceFileName: string;
  status: ValidTextractJobStatus;
}

/** Get Textract SNS message from SQS record */
export function getQueuedExpenseAnalysisNotificationData(
  queueRecord: SQSRecord
): ExpenseAnalysisNotificationData {
  let bodyObject;
  try {
    bodyObject = JSON.parse(queueRecord.body);
  } catch {
    throw new Error("Record body not valid JSON.");
  }

  if (typeof bodyObject !== "object")
    throw new Error("Record body not object.");

  const { Message: message } = bodyObject;

  let messageObject;
  try {
    messageObject = JSON.parse(message);
  } catch {
    throw new Error("Record body message not valid JSON.");
  }

  if (typeof messageObject !== "object")
    throw new Error("Record body message not object.");

  const {
    DocumentLocation: sourceLocation,
    JobId: jobId,
    Status: status,
  } = messageObject;

  if (typeof sourceLocation !== "object")
    throw new Error("No valid document location in record body message.");

  if (typeof jobId !== "string" || jobId.length < 1)
    throw new Error("No valid job ID in record body message.");

  if (!isValidTextractJobStatus(status))
    throw new Error("No valid status in record body message.");

  const { S3Bucket: sourceBucket, S3ObjectName: sourceFileName } =
    sourceLocation;

  if (typeof sourceBucket !== "string" || sourceBucket.length < 1)
    throw new Error(
      "No valid S3 bucket in record body message document location."
    );

  if (typeof sourceFileName !== "string" || sourceFileName.length < 1)
    throw new Error(
      "No valid S3 object name in record body message document location."
    );

  return {
    jobId,
    sourceBucket,
    sourceFileName,
    status,
  };
}

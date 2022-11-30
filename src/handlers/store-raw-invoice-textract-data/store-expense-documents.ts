import { SQSRecord } from "aws-lambda";
import { moveS3, putS3 } from "../../shared/utils";
import { fetchExpenseDocuments } from "./fetch-expense-documents";

export async function storeExpenseDocuments(
  record: SQSRecord,
  destinationBucket: string
): Promise<void> {
  let bodyObject;
  try {
    bodyObject = JSON.parse(record.body);
  } catch {
    throw new Error("Record body not valid JSON.");
  }

  if (typeof bodyObject !== "object")
    throw new Error("Record body not object.");

  const { DocumentLocation: sourceLocation, JobId: jobId } = bodyObject;

  if (typeof sourceLocation !== "object")
    throw new Error("No valid document location in record.");

  if (typeof jobId !== "string" || jobId.length < 1)
    throw new Error("No valid job ID in record.");

  const { S3Bucket: sourceBucket, S3ObjectName: sourceFileName } =
    sourceLocation;

  if (typeof sourceBucket !== "string" || sourceBucket.length < 1)
    throw new Error("No valid S3 bucket in record document location.");

  if (typeof sourceFileName !== "string" || sourceFileName.length < 1)
    throw new Error("No valid S3 object name in record document location.");

  const { documents, status } = await fetchExpenseDocuments(jobId);

  await putS3(destinationBucket, `${jobId}.json`, documents);

  const folderName = status === "SUCCEEDED" ? "successful" : "failed";
  await moveS3(sourceBucket, sourceFileName, `${folderName}/${sourceFileName}`);
}

import { SQSRecord } from "aws-lambda";
import { moveS3, putS3 } from "../../shared/utils";
import { fetchExpenseDocuments } from "./fetch-expense-documents";

export async function storeExpenseDocuments(
  record: SQSRecord,
  pdfBucket: string,
  textractBucket: string
): Promise<void> {
  const bodyObject = JSON.parse(record.body);

  if (typeof bodyObject !== "object")
    throw new Error("Record body not object.");

  const { DocumentLocation: documentLocation, JobId: jobId } = bodyObject;

  if (typeof documentLocation !== "object")
    throw new Error("No valid document location in record.");

  if (typeof jobId !== "string") throw new Error("No valid job ID in record.");

  const { S3Bucket: bucket, S3ObjectName: fileName } = documentLocation;

  if (typeof bucket !== "string" || bucket.length < 1)
    throw new Error("No valid S3 bucket in record document location.");

  if (typeof fileName !== "string" || fileName.length < 1)
    throw new Error("No valid S3 object name in record document location.");

  const { documents, status } = await fetchExpenseDocuments(jobId);

  await putS3(textractBucket, `${jobId}.json`, documents);

  const folderName = status === "SUCCEEDED" ? "successful" : "failed";
  await moveS3(pdfBucket, fileName, `${folderName}/${fileName}`);
}

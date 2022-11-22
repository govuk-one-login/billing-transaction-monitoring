import { SQSRecord } from "aws-lambda";
import { moveS3, putS3 } from "../../shared/utils";
import { fetchExpenseDocuments } from "./fetch-expense-documents";

export async function storeExpenseDocuments(
  record: SQSRecord,
  pdfBucket: string,
  textractBucket: string
): Promise<void> {
  const bodyObject = JSON.parse(record.body);
  const { JobId: jobId } = bodyObject;

  if (typeof jobId !== "string") throw new Error("No valid job ID in record.");

  const { documents, status } = await fetchExpenseDocuments(jobId);

  await putS3(textractBucket, `${jobId}.json`, documents);

  const pdfFileName = "some-file-name.pdf"; // TODO: get real file name somehow
  const folderName = status === "SUCCEEDED" ? "successful" : "failed";
  await moveS3(pdfBucket, pdfFileName, `${folderName}/${pdfFileName}`);
}

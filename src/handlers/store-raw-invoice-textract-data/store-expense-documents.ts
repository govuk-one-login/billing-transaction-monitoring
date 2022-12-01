import { SQSRecord } from "aws-lambda";
import {
  RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE,
  RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS,
} from "../../shared/constants";
import { fetchExpenseDocuments } from "./fetch-expense-documents";
import { getQueuedExpenseAnalysisNotificationData } from "./get-queued-expense-analysis-notification-data";
import { handleTextractFailure } from "./handle-textract-failure";
import { handleTextractSuccess } from "./handle-textract-success";

export async function storeExpenseDocuments(
  record: SQSRecord,
  destinationBucket: string
): Promise<void> {
  const { jobId, sourceBucket, sourceFileName, status } =
    getQueuedExpenseAnalysisNotificationData(record);

  const [sourceFolder] = sourceFileName.split("/");
  if (
    sourceFolder === RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE ||
    sourceFolder === RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS
  )
    return;

  if (status !== "SUCCEEDED")
    return await handleTextractFailure(sourceBucket, sourceFileName);

  let documents;
  try {
    documents = await fetchExpenseDocuments(jobId);
  } catch (error) {
    console.error(error);
    return await handleTextractFailure(sourceBucket, sourceFileName);
  }

  await handleTextractSuccess(
    sourceBucket,
    sourceFileName,
    destinationBucket,
    `${jobId}.json`,
    documents
  );
}

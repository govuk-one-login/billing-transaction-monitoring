import { SQSRecord } from "aws-lambda";
import {
  RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE,
  RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS,
} from "../../shared/constants";
import { logger } from "../../shared/utils";
import { fetchExpenseDocuments } from "./fetch-expense-documents";
import { getQueuedExpenseAnalysisNotificationData } from "./get-queued-expense-analysis-notification-data";
import { handleTextractFailure } from "./handle-textract-failure";
import { handleTextractSuccess } from "./handle-textract-success";

export async function storeExpenseDocuments(
  record: SQSRecord,
  destinationBucket: string
): Promise<void> {
  const { jobId, sourceBucket, sourceFilePath, status } =
    getQueuedExpenseAnalysisNotificationData(record);

  // Source file must be in folder, which determines vendor. Throw error otherwise.
  const sourcePathParts = sourceFilePath.split("/");
  if (sourcePathParts.length < 2)
    throw Error(`File not in vendor folder: ${sourceBucket}/${sourceFilePath}`);

  const sourceFolder = sourcePathParts[0];
  const [sourceFileName] = sourcePathParts.slice(-1);

  // Do not reprocess documents moved to the failure or success folders.
  if (
    sourceFolder === RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE ||
    sourceFolder === RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS
  )
    return;

  if (status !== "SUCCEEDED")
    return await handleTextractFailure(sourceBucket, sourceFilePath);

  let documents;
  try {
    documents = await fetchExpenseDocuments(jobId);
  } catch (error) {
    logger.error("Document fetch error", { error });
    return await handleTextractFailure(sourceBucket, sourceFilePath);
  }

  const destinationFileName: string = (() => {
    // I've done this rather than update the lib
    // I assume es7 was mandated by someone at some point
    const replaceAll = (
      string: string,
      searchValue: string | RegExp,
      replaceValue: string
    ): string => {
      if (!string.match(searchValue)) return string;
      return replaceAll(
        string.replace(searchValue, replaceValue),
        searchValue,
        replaceValue
      );
    };
    return replaceAll(sourceFileName.replace(/\.pdf$/g, ".json"), /\s/g, "_");
  })();

  await handleTextractSuccess(
    sourceBucket,
    sourceFilePath,
    destinationBucket,
    `${sourceFolder}/${destinationFileName}`,
    documents
  );
}

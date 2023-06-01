import { Textract } from "aws-sdk";
import path from "path";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";
import { logger, moveToFolderS3, putS3 } from "../../shared/utils";
import { handleTextractFailure } from "./handle-textract-failure";

export async function handleTextractSuccess(
  sourceBucket: string,
  sourceKey: string,
  resultsBucket: string,
  resultsFileName: string,
  results: Textract.ExpenseDocument[]
): Promise<void> {
  try {
    await putS3(resultsBucket, resultsFileName, results);
  } catch (error) {
    logger.error("Error moving successfully extracted invoice", { error });
    return await handleTextractFailure(sourceBucket, sourceKey);
  }

  const sourceFolderPath = path.dirname(sourceKey);
  const successFolderPath = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${sourceFolderPath}`;
  await moveToFolderS3(sourceBucket, sourceKey, successFolderPath);
}

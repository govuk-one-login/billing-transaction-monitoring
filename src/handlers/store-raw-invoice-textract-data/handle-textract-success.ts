import { Textract } from "aws-sdk";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";
import { moveToFolderS3, putS3 } from "../../shared/utils";
import { handleTextractFailure } from "./handle-textract-failure";

export async function handleTextractSuccess(
  sourceBucket: string,
  sourceFileName: string,
  resultsBucket: string,
  resultsFileName: string,
  results: Textract.ExpenseDocument[]
): Promise<void> {
  try {
    await putS3(resultsBucket, resultsFileName, results);
  } catch (error) {
    console.error(error);
    return await handleTextractFailure(sourceBucket, sourceFileName);
  }

  await moveToFolderS3(
    sourceBucket,
    sourceFileName,
    RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS
  );
}

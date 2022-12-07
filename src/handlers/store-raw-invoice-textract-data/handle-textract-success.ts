import { Textract } from "aws-sdk";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";
import { moveToFolderS3, putS3, sendRecord } from "../../shared/utils";
import { handleTextractFailure } from "./handle-textract-failure";

export async function handleTextractSuccess(
  sourceBucket: string,
  sourceFileName: string,
  resultsBucket: string,
  resultsFileName: string,
  results: Textract.ExpenseDocument[]
): Promise<void> {
  if (
    process.env.OUTPUT_QUEUE_URL === undefined ||
    process.env.OUTPUT_QUEUE_URL.length === 0
  ) {
    const message = "Output queue URL not set.";
    console.error(message);
    throw new Error(message);
  }

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

  await sendRecord(process.env.OUTPUT_QUEUE_URL, JSON.stringify(results));
}

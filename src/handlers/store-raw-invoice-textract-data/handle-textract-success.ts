import { Textract } from "aws-sdk";
import { logger, putS3 } from "../../shared/utils";
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
}

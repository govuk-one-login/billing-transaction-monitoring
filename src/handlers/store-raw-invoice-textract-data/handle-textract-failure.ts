import path from "path";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE } from "../../shared/constants";
import { moveToFolderS3 } from "../../shared/utils";

export async function handleTextractFailure(
  sourceBucket: string,
  sourceKey: string
): Promise<void> {
  const sourceFolderPath = path.dirname(sourceKey);
  const failureFolderPath = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE}/${sourceFolderPath}`;
  await moveToFolderS3(sourceBucket, sourceKey, failureFolderPath);
}

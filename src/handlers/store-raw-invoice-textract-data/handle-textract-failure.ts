import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE } from "../../shared/constants";
import { moveToFolderS3 } from "../../shared/utils";

export async function handleTextractFailure(
  sourceBucket: string,
  sourceFileName: string
): Promise<void> {
  await moveToFolderS3(
    sourceBucket,
    sourceFileName,
    RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE
  );
}

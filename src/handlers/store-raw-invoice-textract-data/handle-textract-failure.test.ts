import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE } from "../../shared/constants";
import { moveToFolderS3 } from "../../shared/utils";
import { handleTextractFailure } from "./handle-textract-failure";

jest.mock("../../shared/utils");
const mockedMoveToFolderS3 = moveToFolderS3 as jest.Mock;

describe("Textract failure handler", () => {
  let givenSourceBucket: string;
  let givenSourceFileName: string;

  beforeEach(() => {
    givenSourceBucket = "given source bucket";
    givenSourceFileName = "given source file name";
  });

  test("Textract failure handler", async () => {
    await handleTextractFailure(givenSourceBucket, givenSourceFileName);

    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenSourceBucket,
      givenSourceFileName,
      RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE
    );
  });
});

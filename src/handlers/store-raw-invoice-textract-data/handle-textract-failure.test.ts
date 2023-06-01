import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE } from "../../shared/constants";
import { moveToFolderS3 } from "../../shared/utils";
import { handleTextractFailure } from "./handle-textract-failure";

jest.mock("../../shared/utils");
const mockedMoveToFolderS3 = moveToFolderS3 as jest.Mock;

describe("Textract failure handler", () => {
  let givenSourceBucket: string;
  let givenSourceFileName: string;
  let givenSourceFolderPath: string;
  let givenSourceKey: string;

  beforeEach(() => {
    givenSourceBucket = "given source bucket";
    givenSourceFileName = "given-source-file.name";
    givenSourceFolderPath = "given/source/folder/path";
    givenSourceKey = `${givenSourceFolderPath}/${givenSourceFileName}`;
  });

  test("Textract failure handler", async () => {
    await handleTextractFailure(givenSourceBucket, givenSourceKey);

    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenSourceBucket,
      givenSourceKey,
      `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE}/${givenSourceFolderPath}`
    );
  });
});

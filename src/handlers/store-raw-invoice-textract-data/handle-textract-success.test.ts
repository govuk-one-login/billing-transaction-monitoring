import { Textract } from "aws-sdk";
// import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";
import { moveToFolderS3, putS3 } from "../../shared/utils";
import { handleTextractFailure } from "./handle-textract-failure";
import { handleTextractSuccess } from "./handle-textract-success";

jest.mock("../../shared/utils");
const mockedMoveToFolderS3 = moveToFolderS3 as jest.Mock;
const mockedPutS3 = putS3 as jest.Mock;

jest.mock("./handle-textract-failure");
const mockedHandleTextractFailure = handleTextractFailure as jest.Mock;

describe("Textract success handler", () => {
  let givenResults: Textract.ExpenseDocument[];
  let givenResultsBucket: string;
  let givenResultsFileName: string;
  let givenSourceBucket: string;
  let givenSourceFileName: string;
  let givenSourceFolderPath: string;
  let givenSourceKey: string;

  beforeEach(() => {
    jest.resetAllMocks();
    givenResults = ["given result" as Textract.ExpenseDocument];
    givenResultsBucket = "given results bucket";
    givenResultsFileName = "given results file name";
    givenSourceBucket = "given source bucket";
    givenSourceFileName = "given-source-file.name";
    givenSourceFolderPath = "given/source/folder/path";
    givenSourceKey = `${givenSourceFolderPath}/${givenSourceFileName}`;
  });

  test("Textract success handler with S3 put error", async () => {
    mockedPutS3.mockRejectedValue(undefined);

    await handleTextractSuccess(
      givenSourceBucket,
      givenSourceKey,
      givenResultsBucket,
      givenResultsFileName,
      givenResults
    );

    expect(mockedPutS3).toHaveBeenCalledTimes(1);
    expect(mockedPutS3).toHaveBeenCalledWith(
      givenResultsBucket,
      givenResultsFileName,
      givenResults
    );
    expect(mockedHandleTextractFailure).toHaveBeenCalledTimes(1);
    expect(mockedHandleTextractFailure).toHaveBeenCalledWith(
      givenSourceBucket,
      givenSourceKey
    );
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  // test("Textract success handler with S3 move error", async () => {
  //   const mockedError = "mocked error";
  //   mockedMoveToFolderS3.mockRejectedValue(mockedError);

  //   let resultError;
  //   try {
  //     await handleTextractSuccess(
  //       givenSourceBucket,
  //       givenSourceKey,
  //       givenResultsBucket,
  //       givenResultsFileName,
  //       givenResults
  //     );
  //   } catch (error) {
  //     resultError = error;
  //   }

  //   expect(resultError).toBe(mockedError);
  //   expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
  //   expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
  //   expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
  //     givenSourceBucket,
  //     givenSourceKey,
  //     `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${givenSourceFolderPath}`
  //   );
  // });

  //   test("Textract success handler with no error", async () => {
  //     await handleTextractSuccess(
  //       givenSourceBucket,
  //       givenSourceKey,
  //       givenResultsBucket,
  //       givenResultsFileName,
  //       givenResults
  //     );

  //     expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
  //     expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
  //     expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
  //       givenSourceBucket,
  //       givenSourceKey,
  //       `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${givenSourceFolderPath}`
  //     );
  //   });
});

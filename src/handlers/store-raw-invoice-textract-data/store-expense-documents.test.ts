import { SQSRecord } from "aws-lambda";
import { Textract } from "aws-sdk";
import {
  RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE,
  RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS,
} from "../../shared/constants";
import { fetchExpenseDocuments } from "./fetch-expense-documents";
import { getQueuedExpenseAnalysisNotificationData } from "./get-queued-expense-analysis-notification-data";
import { handleTextractFailure } from "./handle-textract-failure";
import { handleTextractSuccess } from "./handle-textract-success";
import { storeExpenseDocuments } from "./store-expense-documents";

jest.mock("./fetch-expense-documents");
const mockedFetchExpenseDocuments = fetchExpenseDocuments as jest.Mock;

jest.mock("./get-queued-expense-analysis-notification-data");
const mockedGetQueuedExpenseAnalysisNotificationData =
  getQueuedExpenseAnalysisNotificationData as jest.Mock;

jest.mock("./handle-textract-failure");
const mockedHandleTextractFailure = handleTextractFailure as jest.Mock;

jest.mock("./handle-textract-success");
const mockedHandleTextractSuccess = handleTextractSuccess as jest.Mock;

describe("Expense documents storer", () => {
  const oldConsoleError = console.error;
  let mockedDocuments: Textract.ExpenseDocument[];
  let mockedExpenseAnalysisNotificationData: any;
  let mockedJobId: string;
  let mockedSourceBucket: string;
  let mockedSourceFileName: string;
  let mockedSourceFolder: string;
  let mockedSourceFilePath: string;
  let givenDestinationBucket: string;
  let givenRecord: SQSRecord;

  beforeEach(() => {
    jest.resetAllMocks();

    console.error = jest.fn();

    mockedJobId = "mocked job ID";
    mockedSourceBucket = "mocked source bucket";
    mockedSourceFileName = "mocked source file name";
    mockedSourceFolder = "mocked source folder";
    mockedSourceFilePath = `${mockedSourceFolder}/${mockedSourceFileName}`;
    mockedExpenseAnalysisNotificationData = {
      jobId: mockedJobId,
      sourceBucket: mockedSourceBucket,
      sourceFilePath: mockedSourceFilePath,
      status: "SUCCEEDED",
    };
    mockedGetQueuedExpenseAnalysisNotificationData.mockReturnValue(
      mockedExpenseAnalysisNotificationData
    );

    mockedDocuments = "mocked documents" as any;
    mockedFetchExpenseDocuments.mockResolvedValue(mockedDocuments);

    givenDestinationBucket = "given destination bucket";
    givenRecord = "given record" as any;
  });

  afterAll(() => {
    console.error = oldConsoleError;
  });

  test("Expense documents storer with invalid record", async () => {
    const mockedError = new Error("mocked error");
    mockedGetQueuedExpenseAnalysisNotificationData.mockImplementation(() => {
      throw mockedError;
    });

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(
      mockedGetQueuedExpenseAnalysisNotificationData
    ).toHaveBeenCalledTimes(1);
    expect(mockedGetQueuedExpenseAnalysisNotificationData).toHaveBeenCalledWith(
      givenRecord
    );
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with source file not in folder", async () => {
    mockedSourceFilePath = "mocked source file path without folder";
    mockedExpenseAnalysisNotificationData.sourceFilePath = mockedSourceFilePath;

    await expect(
      storeExpenseDocuments(givenRecord, givenDestinationBucket)
    ).rejects.toThrowError("folder");
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with source file in failure folder", async () => {
    mockedSourceFilePath = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE}/${mockedSourceFileName}`;
    mockedExpenseAnalysisNotificationData.sourceFilePath = mockedSourceFilePath;

    await storeExpenseDocuments(givenRecord, givenDestinationBucket);

    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with source file in success folder", async () => {
    mockedSourceFilePath = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${mockedSourceFileName}`;
    mockedExpenseAnalysisNotificationData.sourceFilePath = mockedSourceFilePath;

    await storeExpenseDocuments(givenRecord, givenDestinationBucket);

    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with unsuccessful status", async () => {
    mockedExpenseAnalysisNotificationData.status = "mocked unsuccessful status";

    await storeExpenseDocuments(givenRecord, givenDestinationBucket);

    expect(mockedHandleTextractFailure).toHaveBeenCalledTimes(1);
    expect(mockedHandleTextractFailure).toHaveBeenCalledWith(
      mockedSourceBucket,
      mockedSourceFilePath
    );
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with document fetch error", async () => {
    mockedFetchExpenseDocuments.mockRejectedValue(undefined);

    await storeExpenseDocuments(givenRecord, givenDestinationBucket);

    expect(mockedFetchExpenseDocuments).toHaveBeenCalledTimes(1);
    expect(mockedFetchExpenseDocuments).toHaveBeenCalledWith(mockedJobId);
    expect(mockedHandleTextractFailure).toHaveBeenCalledTimes(1);
    expect(mockedHandleTextractFailure).toHaveBeenCalledWith(
      mockedSourceBucket,
      mockedSourceFilePath
    );
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with document fetch and failure handler errors", async () => {
    mockedFetchExpenseDocuments.mockRejectedValue(undefined);
    const mockedError = new Error("mocked error");
    mockedHandleTextractFailure.mockRejectedValue(mockedError);

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedHandleTextractSuccess).not.toHaveBeenCalled();
  });

  test("Expense documents storer with success handler error", async () => {
    const mockedError = new Error("mocked error");
    mockedHandleTextractSuccess.mockRejectedValue(mockedError);

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
    expect(mockedHandleTextractSuccess).toHaveBeenCalledTimes(1);
    expect(mockedHandleTextractSuccess).toHaveBeenCalledWith(
      mockedSourceBucket,
      mockedSourceFilePath,
      givenDestinationBucket,
      `${mockedSourceFolder}/mocked_source_file_name.json`,
      mockedDocuments
    );
  });

  test("Expense documents storer with no error", async () => {
    await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    expect(mockedHandleTextractFailure).not.toHaveBeenCalled();
  });
});

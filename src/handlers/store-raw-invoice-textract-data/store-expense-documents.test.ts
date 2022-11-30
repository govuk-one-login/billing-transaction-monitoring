import { SQSRecord } from "aws-lambda";
import { Textract } from "aws-sdk";
import { moveS3, putS3 } from "../../shared/utils";
import { fetchExpenseDocuments } from "./fetch-expense-documents";
import { storeExpenseDocuments } from "./store-expense-documents";

jest.mock("../../shared/utils");
const mockedMoveS3 = moveS3 as jest.Mock;
const mockedPutS3 = putS3 as jest.Mock;

jest.mock("./fetch-expense-documents");
const mockedFetchExpenseDocuments = fetchExpenseDocuments as jest.Mock;

describe("Expense documents storer", () => {
  let mockedDocuments: Textract.ExpenseDocument[];
  let mockedStatus;
  let givenJobId: string;
  let givenRecord: SQSRecord;
  let givenRecordBody: any;
  let givenDestinationBucket: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedDocuments = "mocked documents" as any;
    mockedStatus = "SUCCEEDED";
    mockedFetchExpenseDocuments.mockReturnValue({
      documents: mockedDocuments,
      status: mockedStatus,
    });

    givenJobId = "given job ID";

    givenRecordBody = {
      JobId: givenJobId,
      DocumentLocation: {
        S3Bucket: "given source bucket",
        S3ObjectName: "given source file name",
      },
    };
    givenRecord = {
      body: JSON.stringify(givenRecordBody),
    } as any;

    givenDestinationBucket = "given destination bucket";
  });

  test("Expense documents storer with record body not JSON serialisable", async () => {
    givenRecord.body = "{";

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with record body not object", async () => {
    givenRecord.body = '"some string"';

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with record body without valid job ID", async () => {
    givenRecord.body = JSON.stringify({
      ...givenRecordBody,
      JobId: 1234,
    });

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with record body without valid document location", async () => {
    givenRecord.body = JSON.stringify({
      ...givenRecordBody,
      DocumentLocation: "given invalid document location",
    });

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with record body without valid bucket", async () => {
    givenRecord.body = JSON.stringify({
      ...givenRecordBody,
      DocumentLocation: {
        ...givenRecordBody.DocumentLocation,
        S3Bucket: 1234,
      },
    });

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with record body without valid file name", async () => {
    givenRecord.body = JSON.stringify({
      ...givenRecordBody,
      DocumentLocation: {
        ...givenRecordBody.DocumentLocation,
        S3ObjectName: "",
      },
    });

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedFetchExpenseDocuments).not.toHaveBeenCalled();
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with document fetch error", async () => {
    const mockedFetchExpenseDocumentsError = new Error(
      "mocked fetchExpenseDocuments error"
    );
    mockedFetchExpenseDocuments.mockRejectedValue(
      mockedFetchExpenseDocumentsError
    );

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedFetchExpenseDocumentsError);
    expect(mockedFetchExpenseDocuments).toHaveBeenCalledTimes(1);
    expect(mockedFetchExpenseDocuments).toHaveBeenCalledWith(givenJobId);
    expect(mockedPutS3).not.toHaveBeenCalled();
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with document extraction failure", async () => {
    mockedFetchExpenseDocuments.mockReturnValue({
      documents: mockedDocuments,
      status: "FAILED",
    });

    await storeExpenseDocuments(givenRecord, givenDestinationBucket);

    expect(mockedPutS3).toHaveBeenCalledTimes(1);
    expect(mockedPutS3).toHaveBeenCalledWith(
      givenDestinationBucket,
      `${givenJobId}.json`,
      mockedDocuments
    );
    expect(mockedMoveS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveS3).toHaveBeenCalledWith(
      givenRecordBody.DocumentLocation.S3Bucket,
      givenRecordBody.DocumentLocation.S3ObjectName,
      `failed/${givenRecordBody.DocumentLocation.S3ObjectName as string}`
    );
  });

  test("Expense documents storer with document extraction success", async () => {
    mockedFetchExpenseDocuments.mockReturnValue({
      documents: mockedDocuments,
      status: "SUCCEEDED",
    });

    await storeExpenseDocuments(givenRecord, givenDestinationBucket);

    expect(mockedMoveS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveS3).toHaveBeenCalledWith(
      givenRecordBody.DocumentLocation.S3Bucket,
      givenRecordBody.DocumentLocation.S3ObjectName,
      `successful/${givenRecordBody.DocumentLocation.S3ObjectName as string}`
    );
  });

  test("Expense documents storer with S3 put error", async () => {
    const mockedPutS3Error = new Error("mocked putS3 error");
    mockedPutS3.mockRejectedValue(mockedPutS3Error);

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedPutS3Error);
    expect(mockedPutS3).toHaveBeenCalledTimes(1);
    expect(mockedPutS3).toHaveBeenCalledWith(
      givenDestinationBucket,
      `${givenJobId}.json`,
      mockedDocuments
    );
    expect(mockedMoveS3).not.toHaveBeenCalled();
  });

  test("Expense documents storer with S3 move error", async () => {
    const mockedMoveS3Error = new Error("mocked moveS3 error");
    mockedMoveS3.mockRejectedValue(mockedMoveS3Error);

    let resultError;
    try {
      await storeExpenseDocuments(givenRecord, givenDestinationBucket);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedMoveS3Error);
  });
});

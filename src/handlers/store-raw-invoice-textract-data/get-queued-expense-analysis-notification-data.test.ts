import { SQSRecord } from "aws-lambda";
import { getQueuedExpenseAnalysisNotificationData } from "./get-queued-expense-analysis-notification-data";
import { isValidTextractJobStatus } from "./is-valid-textract-job-status";

jest.mock("./is-valid-textract-job-status");
const mockedIsValidTextractJobStatus =
  isValidTextractJobStatus as unknown as jest.Mock;

describe("Queued expense analysis notification data getter", () => {
  let givenRecord: SQSRecord;
  let givenRecordBody: any;
  let givenRecordBodyMessage: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedIsValidTextractJobStatus.mockReturnValue(true);

    givenRecordBodyMessage = {
      DocumentLocation: {
        S3Bucket: "given source bucket",
        S3ObjectName: "given source file name",
      },
      JobId: "given job ID",
      Status: "given status",
    };

    givenRecordBody = {
      Message: JSON.stringify(givenRecordBodyMessage),
    };

    givenRecord = {
      body: JSON.stringify(givenRecordBody),
    } as any;
  });

  test("Queued expense analysis notification data getter with record body not valid JSON", () => {
    givenRecord.body = "{";

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body not object", () => {
    givenRecord.body = '"some string"';

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message not JSON serialisable", () => {
    givenRecordBody.Message = "{";
    givenRecord.body = JSON.stringify(givenRecordBody);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message not object", () => {
    givenRecordBody.Message = '"some string"';
    givenRecord.body = JSON.stringify(givenRecordBody);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message without valid document location", () => {
    givenRecordBodyMessage.DocumentLocation = "given invalid document location";
    givenRecordBody = { Message: JSON.stringify(givenRecordBodyMessage) };
    givenRecord.body = JSON.stringify(givenRecordBody);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message without valid job ID", () => {
    givenRecordBodyMessage.JobId = "";
    givenRecordBody = { Message: JSON.stringify(givenRecordBodyMessage) };
    givenRecord.body = JSON.stringify(givenRecordBody);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message without valid status", () => {
    mockedIsValidTextractJobStatus.mockReturnValue(false);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message document location without valid bucket", () => {
    givenRecordBodyMessage.DocumentLocation.S3Bucket = null;
    givenRecordBody = { Message: JSON.stringify(givenRecordBodyMessage) };
    givenRecord.body = JSON.stringify(givenRecordBody);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with record body message document location without valid file name", () => {
    givenRecordBodyMessage.DocumentLocation.S3ObjectName = true;
    givenRecordBody = { Message: JSON.stringify(givenRecordBodyMessage) };
    givenRecord.body = JSON.stringify(givenRecordBody);

    let resultError;
    try {
      getQueuedExpenseAnalysisNotificationData(givenRecord);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Queued expense analysis notification data getter with valid record", () => {
    const result = getQueuedExpenseAnalysisNotificationData(givenRecord);

    expect(result).toEqual({
      jobId: givenRecordBodyMessage.JobId,
      sourceBucket: givenRecordBodyMessage.DocumentLocation.S3Bucket,
      sourceFileName: givenRecordBodyMessage.DocumentLocation.S3ObjectName,
      status: givenRecordBodyMessage.Status,
    });
  });
});

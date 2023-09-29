import { SQSRecord } from "aws-lambda";
import { getS3EventRecordsFromSqs, sendRecord } from "../../shared/utils";
import { fetchS3TextractData } from "./fetch-s3-textract-data";
import { getStandardisedInvoice } from "./get-standardised-invoice";
import { sendStandardisedLineItems } from "./send-standardised-line-items";

jest.mock("../../shared/utils");
const mockedGetS3EventRecordsFromSQS = getS3EventRecordsFromSqs as jest.Mock;
const mockedSendRecord = sendRecord as jest.Mock;

jest.mock("./fetch-s3-textract-data");
const mockedFetchS3TextractData = fetchS3TextractData as jest.Mock;

jest.mock("./get-standardised-invoice");
const mockedGetStandardisedInvoice = getStandardisedInvoice as jest.Mock;

describe("Standardised invoice sender", () => {
  let mockedStandardisedInvoice: any[];
  let mockedS3EventRecord1: any;
  let mockedS3EventRecord1Folder: string;
  let mockedS3EventRecord1FileNameWithoutFileExtension: string;
  let mockedS3EventRecord2: any;
  let mockedS3EventRecord2Folder: string;
  let mockedS3EventRecord2FileNameWithoutFileExtension: string;
  let mockedS3EventRecords: any;
  let mockedTextractData: any;
  let givenConfigBucket: string;
  let givenOutputQueueUrl: string;
  let givenParserVersions: Record<string, string>;
  let givenQueueRecord: SQSRecord;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStandardisedInvoice = [
      "mocked Textract line item 1",
      "mocked Textract line item 2",
    ];

    mockedGetStandardisedInvoice.mockResolvedValue(mockedStandardisedInvoice);

    mockedTextractData = "mocked Textract data";
    mockedFetchS3TextractData.mockReturnValue(mockedTextractData);

    mockedS3EventRecord1Folder = "mocked-s3-event-record-1-folder";

    mockedS3EventRecord1FileNameWithoutFileExtension =
      "mocked-s3-event-record-1-s3-object-key";

    mockedS3EventRecord1 = {
      s3: {
        bucket: {
          name: "mocked S3 event record 1 S3 bucket name",
        },
        object: {
          key: `${mockedS3EventRecord1Folder}/${mockedS3EventRecord1FileNameWithoutFileExtension}.json`,
        },
      },
    };

    mockedS3EventRecord2Folder = "mocked-s3-event-record-2-folder";

    mockedS3EventRecord2FileNameWithoutFileExtension =
      "mocked-s3-event-record-2-s3-object-key";

    mockedS3EventRecord2 = {
      s3: {
        bucket: {
          name: "mocked S3 event record 2 S3 bucket name",
        },
        object: {
          key: `${mockedS3EventRecord2Folder}/${mockedS3EventRecord2FileNameWithoutFileExtension}.json`,
        },
      },
    };

    mockedS3EventRecords = [mockedS3EventRecord1, mockedS3EventRecord2];
    mockedGetS3EventRecordsFromSQS.mockReturnValue(mockedS3EventRecords);

    givenConfigBucket = "given config bucket";
    givenOutputQueueUrl = "given destination bucket";
    givenQueueRecord = "given record" as any;

    givenParserVersions = {
      0: "0_1.2.3",
      default: "default_4.5.6",
    };
  });

  test("Standardised invoice sender with invalid queue record", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedGetS3EventRecordsFromSQS.mockImplementation(() => {
      throw mockedError;
    });

    await expect(
      sendStandardisedLineItems(
        givenQueueRecord,
        givenOutputQueueUrl,
        givenConfigBucket,
        givenParserVersions
      )
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedGetS3EventRecordsFromSQS).toHaveBeenCalledTimes(1);
    expect(mockedGetS3EventRecordsFromSQS).toHaveBeenCalledWith(
      givenQueueRecord
    );
    expect(mockedFetchS3TextractData).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Standardised invoice sender with no storage records", async () => {
    mockedGetS3EventRecordsFromSQS.mockReturnValue([]);

    await sendStandardisedLineItems(
      givenQueueRecord,
      givenOutputQueueUrl,
      givenConfigBucket,
      givenParserVersions
    );

    expect(mockedFetchS3TextractData).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Standardised invoice sender with object key not in folder", async () => {
    mockedGetS3EventRecordsFromSQS.mockReturnValue([
      {
        s3: {
          bucket: {
            name: "mocked S3 event record bucket name",
          },
          object: {
            key: "mocked-s3-event-record-object-key-without-folder",
          },
        },
      },
    ]);

    await expect(
      sendStandardisedLineItems(
        givenQueueRecord,
        givenOutputQueueUrl,
        givenConfigBucket,
        givenParserVersions
      )
    ).rejects.toThrowError("folder");
    expect(mockedFetchS3TextractData).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Standardised invoice sender with Textract fetch error", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedFetchS3TextractData.mockImplementation(() => {
      throw mockedError;
    });

    await expect(
      sendStandardisedLineItems(
        givenQueueRecord,
        givenOutputQueueUrl,
        givenConfigBucket,
        givenParserVersions
      )
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedFetchS3TextractData).toHaveBeenCalledTimes(2);
    expect(mockedFetchS3TextractData).toHaveBeenCalledWith(
      mockedS3EventRecord1.s3.bucket.name,
      mockedS3EventRecord1.s3.object.key
    );
    expect(mockedFetchS3TextractData).toHaveBeenCalledWith(
      mockedS3EventRecord2.s3.bucket.name,
      mockedS3EventRecord2.s3.object.key
    );
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Standardised invoice sender with invoice validation failure", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedGetStandardisedInvoice.mockImplementation(() => {
      throw mockedError;
    });

    await expect(
      sendStandardisedLineItems(
        givenQueueRecord,
        givenOutputQueueUrl,
        givenConfigBucket,
        givenParserVersions
      )
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedGetStandardisedInvoice).toHaveBeenCalledTimes(2);
    expect(mockedGetStandardisedInvoice).toHaveBeenCalledWith(
      mockedTextractData,
      mockedS3EventRecord1Folder,
      givenParserVersions,
      `${mockedS3EventRecord1FileNameWithoutFileExtension}.pdf`
    );
    expect(mockedGetStandardisedInvoice).toHaveBeenCalledWith(
      mockedTextractData,
      mockedS3EventRecord2Folder,
      givenParserVersions,
      `${mockedS3EventRecord2FileNameWithoutFileExtension}.pdf`
    );
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Standardised invoice sender with record sending failure", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedSendRecord.mockRejectedValue(mockedError);

    await expect(
      sendStandardisedLineItems(
        givenQueueRecord,
        givenOutputQueueUrl,
        givenConfigBucket,
        givenParserVersions
      )
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedSendRecord).toHaveBeenCalledTimes(2);
    expect(mockedSendRecord).toHaveBeenCalledWith(
      givenOutputQueueUrl,
      JSON.stringify(mockedStandardisedInvoice)
    );
  });

  test("Standardised invoice sender without error", async () => {
    const result = await sendStandardisedLineItems(
      givenQueueRecord,
      givenOutputQueueUrl,
      givenConfigBucket,
      givenParserVersions
    );

    expect(result).toBeUndefined();
  });
});

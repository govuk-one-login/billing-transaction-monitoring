import { SQSRecord } from "aws-lambda";
import {
  getStandardisedInvoiceFileName,
  getStandardisedInvoiceFileNamePrefix,
  listS3Keys,
  moveToFolderS3,
  putTextS3,
} from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

jest.mock("../../shared/utils");
const mockedGetStandardisedInvoiceFileName =
  getStandardisedInvoiceFileName as jest.Mock;
const mockedGetStandardisedInvoiceFileNamePrefix =
  getStandardisedInvoiceFileNamePrefix as jest.Mock;
const mockedListS3Keys = listS3Keys as jest.Mock;
const mockedMoveToFolderS3 = moveToFolderS3 as jest.Mock;
const mockedPutTextS3 = putTextS3 as jest.Mock;

describe("Line item storer", () => {
  let mockedS3StaleFileFolderPath: string;
  let mockedS3StaleKeyWithFolder: string;
  let mockedS3StaleKeyWithNoFolder: string;
  let mockedStandardisedLineItemFileName: string;
  let mockedStandardisedLineItemPrefix: string;
  let givenBucket: string;
  let givenFolder: string;
  let givenRecord: SQSRecord;
  let givenRecordBodyEventName: string;
  let givenRecordBodyInvoiceReceiptDate: string;
  let givenRecordBodyObject: Record<string, unknown>;
  let givenRecordBodyVendorId: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStandardisedLineItemFileName =
      "mocked standardised line item file name";
    mockedGetStandardisedInvoiceFileName.mockReturnValue(
      mockedStandardisedLineItemFileName
    );

    mockedStandardisedLineItemPrefix = "mocked standardised line item prefix";
    mockedGetStandardisedInvoiceFileNamePrefix.mockReturnValue(
      mockedStandardisedLineItemPrefix
    );

    mockedS3StaleFileFolderPath = "mocked-folder-1/mocked-folder-2";
    mockedS3StaleKeyWithFolder = `${mockedS3StaleFileFolderPath}/mocked-S3-mocked-stale-file-name-in-folder`;

    mockedS3StaleKeyWithNoFolder = "mocked-S3-stale-key-with-no-folder";

    mockedListS3Keys.mockResolvedValue([
      mockedS3StaleKeyWithFolder,
      mockedS3StaleKeyWithNoFolder,
    ]);

    givenBucket = "given bucket";
    givenFolder = "given folder";

    givenRecordBodyEventName = "given record body event name";
    givenRecordBodyInvoiceReceiptDate =
      "given record body invoice receipt date";
    givenRecordBodyVendorId = "given record body vendor ID";
    givenRecordBodyObject = {
      event_name: givenRecordBodyEventName,
      invoice_receipt_date: givenRecordBodyInvoiceReceiptDate,
      vendor_id: givenRecordBodyVendorId,
    };

    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;
  });

  test("Line item storer with record body that is not JSON", async () => {
    givenRecord = { body: "{" } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow("not valid JSON");
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with parsed record body that is not an object", async () => {
    givenRecord = { body: "123" } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow("is not object");
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with parsed record body that is null", async () => {
    givenRecord = { body: "null" } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no event name", async () => {
    delete givenRecordBodyObject.event_name;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string event name", async () => {
    givenRecordBodyObject.event_name = 123;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no invoice receipt date string", async () => {
    delete givenRecordBodyObject.invoice_receipt_date;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string invoice receipt date", async () => {
    givenRecordBodyObject.invoice_receipt_date = true;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no vendor ID", async () => {
    delete givenRecordBodyObject.vendor_id;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string vendor ID", async () => {
    givenRecordBodyObject.invoice_receipt_date = null;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileNamePrefix).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 listing failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedListS3Keys.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedGetStandardisedInvoiceFileNamePrefix).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceFileNamePrefix).toHaveBeenCalledWith(
      givenRecordBodyObject
    );
    expect(mockedListS3Keys).toHaveBeenCalledTimes(1);
    expect(mockedListS3Keys).toHaveBeenCalledWith(
      givenBucket,
      `${givenFolder}/${mockedStandardisedLineItemPrefix}`
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 storage failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedPutTextS3.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedGetStandardisedInvoiceFileName).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceFileName).toHaveBeenCalledWith(
      givenRecordBodyObject
    );
    expect(mockedPutTextS3).toHaveBeenCalledTimes(1);
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenBucket,
      `${givenFolder}/${mockedStandardisedLineItemFileName}`,
      givenRecord.body
    );
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 archive failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedMoveToFolderS3.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(givenRecord, givenBucket, givenFolder);

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(2);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenBucket,
      mockedS3StaleKeyWithFolder,
      `${mockedS3StaleFileFolderPath}/archived`
    );
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenBucket,
      mockedS3StaleKeyWithNoFolder,
      "archived"
    );
  });

  test("Line item storer with valid input and working S3 calls", async () => {
    const result = await storeLineItem(givenRecord, givenBucket, givenFolder);
    expect(result).toBeUndefined();
  });
});

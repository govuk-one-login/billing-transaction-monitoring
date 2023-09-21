import {
  getStandardisedInvoiceKey,
  listS3Keys,
  moveToFolderS3,
  putTextS3,
} from "../../shared/utils";
import { storeLineItem } from "./store-line-item";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";
import { StandardisedLineItem } from "../../shared/types";

jest.mock("../../shared/utils");
const mockedGetStandardisedInvoiceKey = getStandardisedInvoiceKey as jest.Mock;
const mockedListS3Keys = listS3Keys as jest.Mock;
const mockedMoveToFolderS3 = moveToFolderS3 as jest.Mock;
const mockedPutTextS3 = putTextS3 as jest.Mock;

describe("Line item storer", () => {
  let mockedS3StaleKey: string;
  let mockedStandardisedLineItemKey: string;
  let mockedStandardisedLineItemPrefix: string;
  let givenArchiveFolder: string;
  let givenDestinationBucket: string;
  let givenDestinationFolder: string;
  let givenRawInvoiceBucket: string;
  let givenRecord: StandardisedLineItem;
  let givenRecordBodyEventName: string;
  let givenRecordBodyInvoicePeriodStart: string;
  let givenRecordBodyVendorId: string;
  let givenRecordBodyOriginalInvoiceFile: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStandardisedLineItemKey =
      "given destination folder/mocked standardised line item key";
    mockedStandardisedLineItemPrefix =
      "given destination folder/mocked standardised line item prefix";

    mockedGetStandardisedInvoiceKey.mockReturnValue([
      mockedStandardisedLineItemKey,
      mockedStandardisedLineItemPrefix,
    ]);

    mockedS3StaleKey = "mocked S3 stale key";
    mockedListS3Keys.mockResolvedValue([mockedS3StaleKey]);

    givenArchiveFolder = "given archive folder";
    givenDestinationBucket = "given bucket";
    givenDestinationFolder = "given destination folder";
    givenRawInvoiceBucket = "given raw invoice bucket";

    givenRecordBodyOriginalInvoiceFile =
      "given record body original invoice file";

    givenRecordBodyEventName = "given record body event name";
    givenRecordBodyInvoicePeriodStart =
      "given record body invoice period start";
    givenRecordBodyVendorId = "given record body vendor ID";
    givenRecord = {
      event_name: givenRecordBodyEventName,
      invoice_receipt_id: "1",
      invoice_receipt_date: "2023-01-01",
      total: 2023.23,
      parser_version: "2",
      invoice_period_start: givenRecordBodyInvoicePeriodStart,
      vendor_id: givenRecordBodyVendorId,
      invoice_is_quarterly: false,
      originalInvoiceFile: givenRecordBodyOriginalInvoiceFile,
    };
  });

  test("Line item storer with record body that is not JSON", async () => {
    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow("not valid JSON");
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with parsed record body that is not an object", async () => {
    givenRecord = { body: "123" } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow("is not object");
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with parsed record body that is null", async () => {
    givenRecord = { body: "null" } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no event name", async () => {
    // @ts-expect-error
    delete givenRecord.event_name;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string event name", async () => {
    givenRecord.event_name = 123 as any;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no invoice period start string", async () => {
    // @ts-expect-error
    delete givenRecord.invoice_period_start;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string invoice period start", async () => {
    givenRecord.invoice_period_start = true as any;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no vendor ID", async () => {
    delete givenRecord.vendor_id;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string vendor ID", async () => {
    givenRecord.invoice_period_start = null as any;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no invoice-is-quarterly option", async () => {
    // @ts-expect-error
    delete givenRecord.invoice_is_quarterly;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-Boolean invoice-is-quarterly option", async () => {
    givenRecord.invoice_is_quarterly = "foo" as any;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 listing failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedListS3Keys.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedListS3Keys).toHaveBeenCalledTimes(1);
    expect(mockedListS3Keys).toHaveBeenCalledWith(
      givenDestinationBucket,
      mockedStandardisedLineItemPrefix
    );
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 storage failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedPutTextS3.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedGetStandardisedInvoiceKey).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceKey).toHaveBeenCalledWith(
      givenDestinationFolder,
      givenRecord
    );
    expect(mockedPutTextS3).toHaveBeenCalledTimes(1);
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenDestinationBucket,
      mockedStandardisedLineItemKey,
      JSON.stringify(givenRecord)
    );
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 archive failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedMoveToFolderS3.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenDestinationBucket,
      mockedS3StaleKey,
      givenArchiveFolder
    );
  });

  test("Line item storer with valid input and working S3 calls", async () => {
    const result = await storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );
    expect(result).toBeUndefined();
  });

  test("failure to move to s3 if aws error", async () => {
    const mockedError = "mocked error";
    mockedMoveToFolderS3
      .mockRejectedValue(mockedError)
      .mockResolvedValueOnce(undefined);

    let resultError;
    try {
      await storeLineItem(
        givenRecord,
        givenDestinationBucket,
        givenDestinationFolder,
        givenArchiveFolder
      );
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(2);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenRawInvoiceBucket,
      `${givenRecord.vendor_id}/${givenRecord.originalInvoiceFile}`,
      `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${givenRecord.vendor_id}`
    );
  });

  test("successfully move to s3 with no aws error", async () => {
    await storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(2);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenRawInvoiceBucket,
      `${givenRecord.vendor_id}/${givenRecord.originalInvoiceFile}`,
      `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${givenRecord.vendor_id}`
    );
  });

  test("check if originalInvoiceFile is parsed", async () => {
    // @ts-expect-error
    delete givenRecord.originalInvoiceFile;
    givenRecord = { body: JSON.stringify(givenRecord) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenDestinationBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedListS3Keys).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });
});

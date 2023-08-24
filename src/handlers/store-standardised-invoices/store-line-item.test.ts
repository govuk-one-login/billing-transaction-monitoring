import { SQSRecord } from "aws-lambda";
import {
  getStandardisedInvoiceKey,
  listS3Keys,
  moveToFolderS3,
  putTextS3,
} from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

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
  let givenBucket: string;
  let givenDestinationFolder: string;
  let givenRecord: SQSRecord;
  let givenRecordBodyEventName: string;
  let givenRecordBodyInvoicePeriodStart: string;
  let givenRecordBodyObject: Record<string, unknown>;
  let givenRecordBodyVendorId: string;

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
    givenBucket = "given bucket";
    givenDestinationFolder = "given destination folder";

    givenRecordBodyEventName = "given record body event name";
    givenRecordBodyInvoicePeriodStart =
      "given record body invoice period start";
    givenRecordBodyVendorId = "given record body vendor ID";
    givenRecordBodyObject = {
      event_name: givenRecordBodyEventName,
      invoice_period_start: givenRecordBodyInvoicePeriodStart,
      vendor_id: givenRecordBodyVendorId,
      invoice_is_quarterly: false,
    };

    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;
  });

  test("Line item storer with record body that is not JSON", async () => {
    givenRecord = { body: "{" } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
      givenBucket,
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
      givenBucket,
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
    delete givenRecordBodyObject.event_name;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    givenRecordBodyObject.event_name = 123;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    delete givenRecordBodyObject.invoice_period_start;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    givenRecordBodyObject.invoice_period_start = true;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    delete givenRecordBodyObject.vendor_id;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    givenRecordBodyObject.invoice_period_start = null;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    delete givenRecordBodyObject.invoice_is_quarterly;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
    givenRecordBodyObject.invoice_is_quarterly = "foo";
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
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
      givenBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedListS3Keys).toHaveBeenCalledTimes(1);
    expect(mockedListS3Keys).toHaveBeenCalledWith(
      givenBucket,
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
      givenBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedGetStandardisedInvoiceKey).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceKey).toHaveBeenCalledWith(
      givenDestinationFolder,
      givenRecordBodyObject
    );
    expect(mockedPutTextS3).toHaveBeenCalledTimes(1);
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenBucket,
      mockedStandardisedLineItemKey,
      givenRecord.body
    );
    expect(mockedMoveToFolderS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 archive failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedMoveToFolderS3.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveToFolderS3).toHaveBeenCalledWith(
      givenBucket,
      mockedS3StaleKey,
      givenArchiveFolder
    );
  });

  test("Line item storer with valid input and working S3 calls", async () => {
    const result = await storeLineItem(
      givenRecord,
      givenBucket,
      givenDestinationFolder,
      givenArchiveFolder
    );
    expect(result).toBeUndefined();
  });
});

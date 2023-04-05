import { SQSRecord } from "aws-lambda";
import {
  getStandardisedInvoiceKey,
  getStandardisedInvoiceFileName,
  putTextS3,
} from "../../shared/utils";
import { storeLineItem } from "./store-line-item";

jest.mock("../../shared/utils");
const mockedGetStandardisedInvoiceKey = getStandardisedInvoiceKey as jest.Mock;
const mockedGetStandardisedInvoiceFileName =
  getStandardisedInvoiceFileName as jest.Mock;
const mockedPutTextS3 = putTextS3 as jest.Mock;

describe("Line item storer", () => {
  let mockedStandardisedLineItemFileName: string;
  let mockedStandardisedLineItemKey: string;
  let givenBucket: string;
  let givenFolder: string;
  let givenLegacyFolder: string;
  let givenRecord: SQSRecord;
  let givenRecordBodyObject: Record<string, unknown>;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStandardisedLineItemFileName =
      "mocked standardised line item file name";

    mockedGetStandardisedInvoiceFileName.mockReturnValue(
      mockedStandardisedLineItemFileName
    );

    mockedStandardisedLineItemKey =
      "given folder/mocked standardised line item key";

    mockedGetStandardisedInvoiceKey.mockReturnValue(
      mockedStandardisedLineItemKey
    );

    givenBucket = "given bucket";
    givenFolder = "given folder";
    givenLegacyFolder = "given legacy folder";

    givenRecordBodyObject = {
      event_name: "given event name",
      invoice_receipt_date: "given invoice receipt date",
      vendor_id: "given vendor ID",
    };

    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;
  });

  test("Line item storer with record body that is not JSON", async () => {
    givenRecord = { body: "{" } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow("not valid JSON");
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with parsed record body that is not an object", async () => {
    givenRecord = { body: "123" } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow("is not object");
  });

  test("Line item storer with parsed record body that is null", async () => {
    givenRecord = { body: "null" } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no event name", async () => {
    delete givenRecordBodyObject.event_name;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string event name", async () => {
    givenRecordBodyObject.event_name = 123;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no invoice receipt date string", async () => {
    delete givenRecordBodyObject.invoice_receipt_date;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string invoice receipt date", async () => {
    givenRecordBodyObject.invoice_receipt_date = true;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with no vendor ID", async () => {
    delete givenRecordBodyObject.vendor_id;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with record body object with non-string vendor ID", async () => {
    givenRecordBodyObject.invoice_receipt_date = null;
    givenRecord = { body: JSON.stringify(givenRecordBodyObject) } as any;

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(
      "is not object with valid fields"
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceKey).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Line item storer with S3 call failure", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    mockedPutTextS3.mockRejectedValueOnce(mockedError);

    const resultPromise = storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    await expect(resultPromise).rejects.toThrow(mockedErrorMessage);
    expect(mockedGetStandardisedInvoiceKey).toHaveBeenCalledTimes(1);
    expect(mockedPutTextS3).toHaveBeenCalledTimes(1);
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenBucket,
      mockedStandardisedLineItemKey,
      givenRecord.body
    );
    expect(mockedGetStandardisedInvoiceFileName).not.toHaveBeenCalled();
  });

  test("Line item storer with valid input and working S3 call", async () => {
    const result = await storeLineItem(
      givenRecord,
      givenBucket,
      givenFolder,
      givenLegacyFolder
    );

    expect(result).toBeUndefined();
    expect(mockedGetStandardisedInvoiceFileName).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceFileName).toHaveBeenCalledWith(
      givenRecordBodyObject
    );
    expect(mockedPutTextS3).toHaveBeenCalledTimes(2);
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenBucket,
      `${givenLegacyFolder}/${mockedStandardisedLineItemFileName}`,
      givenRecord.body
    );
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenBucket,
      mockedStandardisedLineItemKey,
      givenRecord.body
    );
  });
});

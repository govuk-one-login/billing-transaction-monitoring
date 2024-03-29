import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "./handler";
import { storeLineItem } from "./store-line-item";
import { getFromEnv, moveToFolderS3 } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedGetFromEnv = getFromEnv as jest.Mock;
const mockedMoveToFolderS3 = moveToFolderS3 as jest.Mock;

jest.mock("./store-line-item");
const mockedStoreLineItem = storeLineItem as jest.Mock;

describe("Store Standardised Invoices handler tests", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let givenEvent: SQSEvent;

  const body1 = {
    item_id: 123456,
    originalInvoiceFile: "testFile1",
    vendor_id: 987654,
  };
  const givenRecord1 = {
    vendor_id: 123456,
    messageId: "given record 1 message ID",
    body: JSON.stringify([body1]),
  } as unknown as SQSRecord;
  const body2 = {
    item_id: 135769,
    originalInvoiceFile: "testFile2",
    vendor_id: 987654,
  };
  const givenRecord2 = {
    messageId: "given record 2 message ID",
    body: JSON.stringify([body2]),
  } as unknown as SQSRecord;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedEnv = {
      ARCHIVE_FOLDER: "given archive folder",
      DESTINATION_BUCKET: "given destination bucket",
      DESTINATION_FOLDER: "given destination folder",
      RAW_INVOICE_BUCKET: "given raw invoice bucket",
    };

    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);

    givenEvent = { Records: [] };
  });

  test("Store Standardised Invoices handler with no archive folder set", async () => {
    delete mockedEnv.ARCHIVE_FOLDER;
    await expect(handler(givenEvent)).rejects.toThrowError("Archive folder");
  });

  test("Store Standardised Invoices handler with no destination bucket set", async () => {
    delete mockedEnv.DESTINATION_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Destination bucket"
    );
  });

  test("Store Standardised Invoices handler with no destination folder set", async () => {
    delete mockedEnv.DESTINATION_FOLDER;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Destination folder"
    );
  });

  test("Store Standardised Invoices handler with no raw invoice bucket set", async () => {
    delete mockedEnv.RAW_INVOICE_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Raw invoice bucket"
    );
  });

  test("record contains no body", async () => {
    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1);
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Record contains no body"
    );
  });

  test("Store Standardised Invoices handler with two failing records", async () => {
    mockedStoreLineItem.mockRejectedValue(undefined);
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreLineItem).toHaveBeenCalledTimes(2);
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      body1,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      body2,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [
        { itemIdentifier: JSON.stringify(body1) },
        { itemIdentifier: JSON.stringify(body2) },
      ],
    });
  });

  test("Store Standardised Invoices handler with one failing and one passing record", async () => {
    mockedStoreLineItem.mockRejectedValueOnce(undefined);
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreLineItem).toHaveBeenCalledTimes(2);
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      body1,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      body2,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: JSON.stringify(body1) }],
    });
    expect(mockedMoveToFolderS3).toHaveBeenCalledTimes(1);
    expect(mockedMoveToFolderS3).toBeCalledWith(
      mockedEnv.RAW_INVOICE_BUCKET,
      `${body2.vendor_id}/${body2.originalInvoiceFile}`,
      `successful/${body2.vendor_id}`
    );
  });

  test("Store Standard", async () => {
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreLineItem).toHaveBeenCalledTimes(2);
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      body1,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      body2,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [],
    });
    expect(mockedMoveToFolderS3).toBeCalledTimes(2);
    expect(mockedMoveToFolderS3).toBeCalledWith(
      mockedEnv.RAW_INVOICE_BUCKET,
      `${body1.vendor_id}/${body1.originalInvoiceFile}`,
      `successful/${body1.vendor_id}`
    );
    expect(mockedMoveToFolderS3).toBeCalledWith(
      mockedEnv.RAW_INVOICE_BUCKET,
      `${body2.vendor_id}/${body2.originalInvoiceFile}`,
      `successful/${body2.vendor_id}`
    );
  });
});

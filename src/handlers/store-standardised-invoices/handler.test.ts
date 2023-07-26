import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "./handler";
import { storeLineItem } from "./store-line-item";
import { getFromEnv } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("./store-line-item");
const mockedStoreLineItem = storeLineItem as jest.Mock;

describe("Store Standardised Invoices handler tests", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedEnv = {
      ARCHIVE_FOLDER: "given archive folder",
      DESTINATION_BUCKET: "given destination bucket",
      DESTINATION_FOLDER: "given destination folder",
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

  test("Store Standardised Invoices handler with two failing records", async () => {
    mockedStoreLineItem.mockRejectedValue(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreLineItem).toHaveBeenCalledTimes(2);
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      givenRecord1,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      givenRecord2,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [
        { itemIdentifier: "given record 1 message ID" },
        { itemIdentifier: "given record 2 message ID" },
      ],
    });
  });

  test("Store Standardised Invoices handler with one failing and one passing record", async () => {
    mockedStoreLineItem.mockRejectedValueOnce(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreLineItem).toHaveBeenCalledTimes(2);
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      givenRecord1,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(mockedStoreLineItem).toHaveBeenCalledWith(
      givenRecord2,
      mockedEnv.DESTINATION_BUCKET,
      mockedEnv.DESTINATION_FOLDER,
      mockedEnv.ARCHIVE_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given record 1 message ID" }],
    });
  });
});

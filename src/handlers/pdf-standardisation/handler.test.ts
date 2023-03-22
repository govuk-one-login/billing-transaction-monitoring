import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "./handler";
import { storeStandardisedInvoices } from "./store-standardised-invoices";

jest.mock("../../shared/utils/logger");

jest.mock("./store-standardised-invoices");
const mockedStoreStandardisedInvoices =
  storeStandardisedInvoices as jest.MockedFn<typeof storeStandardisedInvoices>;

describe("Store Standardised Invoices handler tests", () => {
  const OLD_ENV = process.env;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    process.env = {
      ...OLD_ENV,
      CONFIG_BUCKET: "given config bucket",
      DESTINATION_BUCKET: "given destination bucket",
      DESTINATION_FOLDER: "given destination folder",
      PARSER_0_VERSION: "1.2.3",
      PARSER_DEFAULT_VERSION: "4.5.6",
    };

    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("Store Standardised Invoices handler with no config bucket set", async () => {
    delete process.env.CONFIG_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError("Config bucket");
  });

  test("Store Standardised Invoices handler with no destination bucket set", async () => {
    delete process.env.DESTINATION_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Destination bucket"
    );
  });

  test("Store Standardised Invoices handler with no destination folder set", async () => {
    delete process.env.DESTINATION_FOLDER;
    await expect(handler(givenEvent)).rejects.toThrowError("folder");
  });

  test("Store Standardised Invoices handler with no parser 0 version set", async () => {
    delete process.env.PARSER_0_VERSION;
    await expect(handler(givenEvent)).rejects.toThrowError("Parser 0 version");
  });

  test("Store Standardised Invoices handler with no default parser version set", async () => {
    delete process.env.PARSER_DEFAULT_VERSION;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Default parser version"
    );
  });

  test("Store Standardised Invoices handler with two failing records", async () => {
    mockedStoreStandardisedInvoices.mockRejectedValue(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledTimes(2);
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord1,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER,
      process.env.CONFIG_BUCKET,
      {
        0: `0_${process.env.PARSER_0_VERSION}`,
        default: `default_${process.env.PARSER_DEFAULT_VERSION}`,
      }
    );
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord2,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER,
      process.env.CONFIG_BUCKET,
      {
        0: `0_${process.env.PARSER_0_VERSION}`,
        default: `default_${process.env.PARSER_DEFAULT_VERSION}`,
      }
    );
    expect(result).toEqual({
      batchItemFailures: [
        { itemIdentifier: "given record 1 message ID" },
        { itemIdentifier: "given record 2 message ID" },
      ],
    });
  });

  test("Store Standardised Invoices handler with one failing and one passing record", async () => {
    mockedStoreStandardisedInvoices.mockRejectedValueOnce(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledTimes(2);
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord1,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER,
      process.env.CONFIG_BUCKET,
      {
        0: `0_${process.env.PARSER_0_VERSION}`,
        default: `default_${process.env.PARSER_DEFAULT_VERSION}`,
      }
    );
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord2,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER,
      process.env.CONFIG_BUCKET,
      {
        0: `0_${process.env.PARSER_0_VERSION}`,
        default: `default_${process.env.PARSER_DEFAULT_VERSION}`,
      }
    );
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given record 1 message ID" }],
    });
  });
});

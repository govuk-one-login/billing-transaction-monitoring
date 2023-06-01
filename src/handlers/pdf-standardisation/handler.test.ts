import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "./handler";
import { sendStandardisedLineItems } from "./send-standardised-line-items";

jest.mock("../../shared/utils/logger");

jest.mock("./send-standardised-line-items");
const mockedSendStandardisedLineItems =
  sendStandardisedLineItems as jest.MockedFn<typeof sendStandardisedLineItems>;

describe("Store Standardised Invoices handler tests", () => {
  const OLD_ENV = process.env;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    process.env = {
      ...OLD_ENV,
      CONFIG_BUCKET: "given config bucket",
      OUTPUT_QUEUE_URL: "given output queue URL",
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

  test("Store Standardised Invoices handler with no output queue URL set", async () => {
    delete process.env.OUTPUT_QUEUE_URL;
    await expect(handler(givenEvent)).rejects.toThrowError("Output queue URL");
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
    mockedSendStandardisedLineItems.mockRejectedValue(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedSendStandardisedLineItems).toHaveBeenCalledTimes(2);
    expect(mockedSendStandardisedLineItems).toHaveBeenCalledWith(
      givenRecord1,
      process.env.OUTPUT_QUEUE_URL,
      process.env.CONFIG_BUCKET,
      {
        0: `0_${process.env.PARSER_0_VERSION}`,
        default: `default_${process.env.PARSER_DEFAULT_VERSION}`,
      }
    );
    expect(mockedSendStandardisedLineItems).toHaveBeenCalledWith(
      givenRecord2,
      process.env.OUTPUT_QUEUE_URL,
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
    mockedSendStandardisedLineItems.mockRejectedValueOnce(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedSendStandardisedLineItems).toHaveBeenCalledTimes(2);
    expect(mockedSendStandardisedLineItems).toHaveBeenCalledWith(
      givenRecord1,
      process.env.OUTPUT_QUEUE_URL,
      process.env.CONFIG_BUCKET,
      {
        0: `0_${process.env.PARSER_0_VERSION}`,
        default: `default_${process.env.PARSER_DEFAULT_VERSION}`,
      }
    );
    expect(mockedSendStandardisedLineItems).toHaveBeenCalledWith(
      givenRecord2,
      process.env.OUTPUT_QUEUE_URL,
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

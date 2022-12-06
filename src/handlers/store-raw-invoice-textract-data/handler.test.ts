import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "./handler";
import { storeExpenseDocuments } from "./store-expense-documents";

jest.mock("./store-expense-documents");
const mockedStoreExpenseDocuments = storeExpenseDocuments as jest.MockedFn<
  typeof storeExpenseDocuments
>;

describe("Store Raw Invoice Textract Data handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    console.error = jest.fn();

    process.env = {
      ...OLD_ENV,
      DESTINATION_BUCKET: "given destination bucket",
    };

    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  test("Store Raw Invoice Textract Data handler with no destination bucket set", async () => {
    delete process.env.DESTINATION_BUCKET;

    let resultError;
    try {
      await handler(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Store Raw Invoice Textract Data handler with two failing records", async () => {
    mockedStoreExpenseDocuments.mockRejectedValue(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreExpenseDocuments).toHaveBeenCalledTimes(2);
    expect(mockedStoreExpenseDocuments).toHaveBeenCalledWith(
      givenRecord1,
      process.env.DESTINATION_BUCKET
    );
    expect(mockedStoreExpenseDocuments).toHaveBeenCalledWith(
      givenRecord2,
      process.env.DESTINATION_BUCKET
    );
    expect(result).toEqual({
      batchItemFailures: [
        { itemIdentifier: "given record 1 message ID" },
        { itemIdentifier: "given record 2 message ID" },
      ],
    });
  });

  test("Store Raw Invoice Textract Data handler with one failing and one passing record", async () => {
    mockedStoreExpenseDocuments.mockRejectedValueOnce(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreExpenseDocuments).toHaveBeenCalledTimes(2);
    expect(mockedStoreExpenseDocuments).toHaveBeenCalledWith(
      givenRecord1,
      process.env.DESTINATION_BUCKET
    );
    expect(mockedStoreExpenseDocuments).toHaveBeenCalledWith(
      givenRecord2,
      process.env.DESTINATION_BUCKET
    );
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given record 1 message ID" }],
    });
  });
});

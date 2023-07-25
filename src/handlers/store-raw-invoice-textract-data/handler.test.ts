import { SQSEvent, SQSRecord } from "aws-lambda";
import { getFromEnv } from "../../shared/utils/env";
import { handler } from "./handler";
import { storeExpenseDocuments } from "./store-expense-documents";

jest.mock("../../shared/utils/env");
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("../../shared/utils/logger");

jest.mock("./store-expense-documents");
const mockedStoreExpenseDocuments = storeExpenseDocuments as jest.MockedFn<
  typeof storeExpenseDocuments
>;

describe("Store Raw Invoice Textract Data handler tests", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedEnv = { DESTINATION_BUCKET: "given destination bucket" };
    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);

    givenEvent = { Records: [] };
  });

  test("Store Raw Invoice Textract Data handler with no destination bucket set", async () => {
    delete mockedEnv.DESTINATION_BUCKET;

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
      mockedEnv.DESTINATION_BUCKET
    );
    expect(mockedStoreExpenseDocuments).toHaveBeenCalledWith(
      givenRecord2,
      mockedEnv.DESTINATION_BUCKET
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
      mockedEnv.DESTINATION_BUCKET
    );
    expect(mockedStoreExpenseDocuments).toHaveBeenCalledWith(
      givenRecord2,
      mockedEnv.DESTINATION_BUCKET
    );
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given record 1 message ID" }],
    });
  });
});

import { handler } from "./handler";
import {
  createEvent,
  createEventRecordWithName,
} from "../../../test-helpers/SQS";
import { sendRecord } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

describe("Filter handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  const oldConsoleLog = console.log;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    console.error = jest.fn();
    console.log = jest.fn();
    mockedSendRecord.mockClear();
    process.env.OUTPUT_QUEUE_URL = "output-queue-url";
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
    console.log = oldConsoleLog;
  });

  test("Filter handler with empty event batch", async () => {
    const event = createEvent([]);

    await handler(event);

    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Filter handler with some valid events and some ignored", async () => {
    const validRecord1 = createEventRecordWithName(
      "EVENT_1",
      1
    );
    const validRecord2 = createEventRecordWithName(
      "EVENT_5",
      2
    );
    const ignoredRecord = createEventRecordWithName(
      "SOME_IGNORED_EVENT_NAME",
      3
    );
    const event = createEvent([validRecord1, validRecord2, ignoredRecord]);

    await handler(event);

    expect(mockedSendRecord).toHaveBeenCalledTimes(2);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(
      1,
      "output-queue-url",
      validRecord1.body
    );
    expect(mockedSendRecord).toHaveBeenNthCalledWith(
      2,
      "output-queue-url",
      validRecord2.body
    );
  });

  test("SQS output queue not defined", async () => {
    process.env.OUTPUT_QUEUE_URL = undefined;

    const validRecord = createEventRecordWithName(
      "EVENT_1",
      1
    );

    const event = createEvent([validRecord]);

    const result = await handler(event);
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual("1");
  });

  test("Failing send message", async () => {
    const validRecord = createEventRecordWithName(
      "EVENT_1",
      1
    );
    const invalidRecord = createEventRecordWithName(
      "EVENT_5",
      2
    );

    const event = createEvent([validRecord, invalidRecord]);

    mockedSendRecord
      .mockImplementationOnce(async () => {})
      .mockImplementationOnce(async () => {
        throw new Error("error");
      });

    const result = await handler(event);

    expect(mockedSendRecord).toHaveBeenCalledTimes(2);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(
      1,
      "output-queue-url",
      validRecord.body
    );
    expect(mockedSendRecord).toHaveBeenNthCalledWith(
      2,
      "output-queue-url",
      invalidRecord.body
    );
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual("2");
  });
});

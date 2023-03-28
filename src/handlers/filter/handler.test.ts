import { handler } from "./handler";
import {
  createEvent,
  createEventRecordWithName,
} from "../../../test-helpers/SQS";
import { sendRecord } from "../../shared/utils";

jest.mock("../../shared/utils");
jest.mock("../../handler-context/config");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

describe("Filter handler", () => {
  beforeEach(() => {
    process.env.OUTPUT_QUEUE_URL = "output-queue-url";
  });
  afterAll(() => {
    delete process.env.OUTPUT_QUEUE_URL;
  });

  test("Filter handler with some valid events and some ignored", async () => {
    const validRecord1 = createEventRecordWithName(
      "EXECUTIVE_ENDUNKENING_COMPLETED",
      1
    );
    const validRecord2 = createEventRecordWithName(
      "SPIRIT_CONSUMPTION_EXECUTION_TASK_START",
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
});

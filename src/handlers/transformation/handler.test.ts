import { handler } from "./handler";
import { createEvent } from "../../../test-helpers/S3";
import { sendRecord } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

describe("Transformation handler tests", () => {
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

  test("Transformation handler with empty event batch", async () => {
    const event = createEvent([]);
    await handler(event);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });
});

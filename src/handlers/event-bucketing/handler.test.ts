import { SQSEvent } from "aws-lambda";
import { handler } from "./handler";
import { getFromEnv } from "../../shared/utils";
import { businessLogic } from "./business-logic";

jest.mock("../../shared/utils");
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("./business-logic");
const mockedBusinessLogic = businessLogic as jest.Mock;

describe("Store Standardised Invoices handler tests", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let givenEvent: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedEnv = {
      BUCKETING_DAYS_TO_PROCESS: "given days to process",
      STORAGE_BUCKET: "given storage bucket",
    };

    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);

    mockedBusinessLogic.mockImplementation(() => []);

    givenEvent = { Records: [] };
  });

  test("Store Standardised Invoices handler with no archive folder set", async () => {
    delete mockedEnv.STORAGE_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Environment is not valid"
    );
  });

  test("Store Standardised Invoices handler with no messagebody", async () => {
    givenEvent.Records.push({
      body: null,
      messageId: "given message ID",
    });
    await handler(givenEvent as SQSEvent);
    expect(mockedBusinessLogic).toBeCalledTimes(1);
  });

  test("Store Standardised Invoices handler with valid messagebody", async () => {
    const body = {
      start_date: "2023-01-01",
      end_date: "2023-01-02",
    };
    givenEvent.Records.push({
      body: JSON.stringify(body),
      messageId: "given message ID",
    });
    await handler(givenEvent as SQSEvent);
    expect(mockedBusinessLogic).toBeCalledTimes(1);
  });

  test("Store Standardised Invoices handler with invalid messagebody", async () => {
    const body = {
      date: "2023-01-01",
      end_date: "2023-01-02",
    };
    givenEvent.Records.push({
      body: JSON.stringify(body),
      messageId: "given message ID",
    });
    await expect(handler(givenEvent as SQSEvent)).rejects.toThrowError(
      "Failed to make message"
    );
  });
});

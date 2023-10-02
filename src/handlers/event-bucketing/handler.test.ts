import { SQSEvent } from "aws-lambda";
import { handler } from "./handler";
import { getFromEnv } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedGetFromEnv = getFromEnv as jest.Mock;

describe("Store Standardised Invoices handler tests", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedEnv = {
      STORAGE_BUCKET: "given storage bucket",
    };

    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);

    givenEvent = { Records: [] };
  });

  test("Store Standardised Invoices handler with no archive folder set", async () => {
    delete mockedEnv.STORAGE_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Environment is not valid"
    );
  });
});

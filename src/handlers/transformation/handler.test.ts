import { handler } from "./handler";
import { transformCsvToJson } from "./transform-csv-to-json";
import { createEvent } from "../../../test-helpers/S3";
import { readJsonFromS3 } from "../../shared/utils";
import { S3Event } from "aws-lambda";
import { transformRow } from "./transform-row";
import { buildRow } from "../../../test-helpers/build-rows";

jest.mock("./transform-row");
const mockedTransformRow = transformRow as jest.MockedFunction<
  typeof transformRow
>;

jest.mock("../../shared/utils");
const mockedReadJsonFromS3 = readJsonFromS3 as jest.MockedFunction<
  typeof readJsonFromS3
>;

jest.mock("./transform-csv-to-json");
const mockedTransformCsvToJson = transformCsvToJson as jest.MockedFunction<
  typeof transformCsvToJson
>;

describe("Transformation handler test", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let givenEvent: S3Event;

  beforeEach(() => {
    jest.resetAllMocks();
    console.error = jest.fn();
    process.env = {
      ...OLD_ENV,
      OUTPUT_QUEUE_URL: "output queue url",
    };
    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  const client1 = "https://a.client1.eu";
  const client2 = "https://a.client2.eu";
  const clientId1 = "client1";
  const clientId2 = "client2";
  const eventName1 = "event name 1";
  const eventName2 = "event name 2";
  const timestamp = "2022-10-01T00:27:41.186Z";
  const idpClientLookUp = {
    [client1]: clientId1,
    [client2]: clientId2,
  };

  const client1Rules = [
    {
      "Minimum Level Of Assurance": "LEVEL_1",
      "Billable Status": "BILLABLE",
      "Event Name": eventName1,
    },
    {
      "Minimum Level Of Assurance": "LEVEL_1",
      "Billable Status": "REPEAT-BILLABLE",
      "Event Name": eventName2,
    },
  ];
  const eventNameRules = {
    [client1]: client1Rules,
  };
  const csvRows = [
    buildRow(client1, timestamp, "event-id-1", "LEVEL_1", "BILLABLE"),
    buildRow(client1, timestamp, "event-id-2", "LEVEL_1", "REPEAT-BILLABLE"),
  ];

  test("should throw error if no output queue set", async () => {
    delete process.env.OUTPUT_QUEUE_URL;
    await expect(handler(givenEvent)).rejects.toThrowError("Output queue");
  });

  test("should throw error with failing idpClient or eventNameRules Lookup", async () => {
    mockedReadJsonFromS3.mockRejectedValue("Error reading from S3");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transformation Handler error"
    );
    expect(mockedReadJsonFromS3).toHaveBeenCalled();
    expect(mockedTransformCsvToJson).not.toHaveBeenCalled();
    expect(mockedTransformRow).not.toHaveBeenCalled();
  });

  test("should throw error with failing transformCsvToJson", async () => {
    mockedTransformCsvToJson.mockRejectedValue("Error transforming data");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transformation Handler error"
    );
    expect(mockedReadJsonFromS3).toHaveBeenCalled();
    expect(mockedTransformCsvToJson).toHaveBeenCalled();
    expect(mockedTransformRow).not.toHaveBeenCalled();
  });

  test("should call transformRow with the expected paramaters", async () => {
    mockedReadJsonFromS3.mockResolvedValueOnce(idpClientLookUp);
    mockedReadJsonFromS3.mockResolvedValueOnce(eventNameRules);
    mockedTransformCsvToJson.mockResolvedValue(csvRows);
    await handler(createEvent([]));
    expect(mockedTransformRow).toHaveBeenCalledTimes(2);
    expect(mockedTransformRow).toHaveBeenCalledWith(
      csvRows[0],
      idpClientLookUp,
      eventNameRules,
      "output queue url"
    );
    expect(mockedTransformRow).toHaveBeenCalledWith(
      csvRows[1],
      idpClientLookUp,
      eventNameRules,
      "output queue url"
    );
  });
});

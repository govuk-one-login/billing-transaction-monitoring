import { handler } from "./handler";
import { transformCsvToJson } from "./transform-csv-to-json";
import { createEvent } from "../../../test-helpers/S3";
import { readJsonFromS3 } from "../../shared/utils";
import { S3Event } from "aws-lambda";
import { processRow } from "./process-row";
import { buildRow } from "../../../test-helpers/build-rows";

jest.mock("./process-row");
const mockedProcessRow = processRow as jest.MockedFunction<typeof processRow>;

jest.mock("../../shared/utils");
const mockedReadJsonFromS3 = readJsonFromS3 as jest.MockedFunction<
  typeof readJsonFromS3
>;

jest.mock("./transform-csv-to-json");
const mockedTransformCsvToJson = transformCsvToJson as jest.MockedFunction<
  typeof transformCsvToJson
>;

describe("Transaction CSV To JSON Event handler test", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let givenEvent: S3Event;

  beforeEach(() => {
    jest.resetAllMocks();
    console.error = jest.fn();
    process.env = {
      ...OLD_ENV,
      OUTPUT_QUEUE_URL: "output queue url",
      CONFIG_BUCKET: "config bucket",
    };
    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  const client1 = "https://a.client1.eu";
  const timestamp = "2022-10-01T00:27:41.186Z";
  const idpClientLookUp = {
    [client1]: "client1",
  };
  const eventNameRules = {
    [client1]: [
      {
        "rule name": "rule value",
      },
    ],
  };
  const csvRows = [
    buildRow(
      client1,
      timestamp,
      "some request id",
      "some min level",
      "some status",
      "some entity id 1"
    ),
    buildRow(
      client1,
      timestamp,
      "another request id 2",
      "another min level",
      "another status",
      "another entity 2"
    ),
  ];

  test("should throw error if no output queue set", async () => {
    delete process.env.OUTPUT_QUEUE_URL;
    await expect(handler(givenEvent)).rejects.toThrowError("Output queue");
  });

  test("should throw error if no config bucket set", async () => {
    delete process.env.CONFIG_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError("Config Bucket");
  });

  test("should throw error with failing idpClient or eventNameRules Lookup", async () => {
    mockedReadJsonFromS3.mockRejectedValue("Error reading from S3");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedReadJsonFromS3).toHaveBeenCalled();
    expect(mockedTransformCsvToJson).not.toHaveBeenCalled();
    expect(mockedProcessRow).not.toHaveBeenCalled();
  });

  test("should throw error with failing transformCsvToJson", async () => {
    mockedTransformCsvToJson.mockRejectedValue("Error transforming data");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedReadJsonFromS3).toHaveBeenCalled();
    expect(mockedTransformCsvToJson).toHaveBeenCalled();
    expect(mockedProcessRow).not.toHaveBeenCalled();
  });

  test("should call processRow with the expected paramaters", async () => {
    mockedReadJsonFromS3.mockResolvedValueOnce(idpClientLookUp);
    mockedReadJsonFromS3.mockResolvedValueOnce(eventNameRules);
    mockedTransformCsvToJson.mockResolvedValue(csvRows);
    await handler(createEvent([]));
    expect(mockedProcessRow).toHaveBeenCalledTimes(2);
    expect(mockedProcessRow).toHaveBeenCalledWith(
      csvRows[0],
      idpClientLookUp,
      eventNameRules,
      "output queue url"
    );
    expect(mockedProcessRow).toHaveBeenCalledWith(
      csvRows[1],
      idpClientLookUp,
      eventNameRules,
      "output queue url"
    );
  });
});

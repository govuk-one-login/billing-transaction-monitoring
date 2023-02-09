import { handler } from "./handler";
import { transformCsvToJson } from "./transform-csv-to-json";
import { createEvent } from "../../../test-helpers/S3";
import { S3Event } from "aws-lambda";
import { buildRow } from "../../../test-helpers/build-rows";
import { fetchS3, sendRecord } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.MockedFunction<typeof fetchS3>;
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

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

  const vendor1 = "https://a.vendor1.eu";
  const timestamp = "2022-10-01T00:27:41.186Z";
  const idpVendorLookUp = {
    [vendor1]: "vendor1",
  };
  const eventNameRules = {
    [vendor1]: [
      {
        "rule name": "rule value",
      },
    ],
  };

  test("should throw error if no output queue set", async () => {
    delete process.env.OUTPUT_QUEUE_URL;
    await expect(handler(givenEvent)).rejects.toThrowError("Output queue");
  });

  test("should throw error if no config bucket set", async () => {
    delete process.env.CONFIG_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError("Config Bucket");
  });

  test("should throw error with failing idpVendor or eventNameRules Lookup", async () => {
    mockedFetchS3.mockRejectedValue("Error reading from S3");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedFetchS3).toHaveBeenCalled();
    expect(mockedTransformCsvToJson).not.toHaveBeenCalled();
  });

  test("should throw error with failing transformCsvToJson", async () => {
    mockedFetchS3.mockResolvedValueOnce(JSON.stringify(idpVendorLookUp));
    mockedFetchS3.mockResolvedValueOnce(JSON.stringify(eventNameRules));
    mockedTransformCsvToJson.mockRejectedValue("Error transforming data");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedFetchS3).toHaveBeenCalled();
    expect(mockedTransformCsvToJson).toHaveBeenCalled();
  });

  test("should call processRow with the expected parameters", async () => {
    mockedFetchS3.mockResolvedValueOnce(
      JSON.stringify({
        "https://a.vendor3.eu": "vendor3",
        "https://a.vendor4.co.uk": "vendor4",
      })
    );
    mockedFetchS3.mockResolvedValueOnce(
      JSON.stringify({
        "https://a.vendor3.eu": [
          {
            "Minimum Level Of Assurance": "LEVEL_1",
            "Billable Status": "BILLABLE",
            "Event Name": "IPV_C3_TEST1",
          },
        ],
        "https://a.vendor4.co.uk": [
          {
            "Minimum Level Of Assurance": "LEVEL_1",
            "Billable Status": "BILLABLE",
            "Event Name": "IPV_C4_TEST1",
          },
        ],
      })
    );
    mockedTransformCsvToJson.mockResolvedValue([
      buildRow(
        "https://a.vendor3.eu",
        timestamp,
        "some request id",
        "LEVEL_1",
        "BILLABLE",
        "some entity id 1"
      ),
      buildRow(
        "https://a.vendor4.co.uk",
        timestamp,
        "another request id 2",
        "LEVEL_1",
        "BILLABLE",
        "another entity 2"
      ),
    ]);
    await handler(createEvent([]));
    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output queue url",
      '{"event_id":"some request id","timestamp":1664584061,"timestamp_formatted":"2022-10-01T00:27:41.186Z","event_name":"IPV_C3_TEST1","component_id":"some entity id 1","vendor_id":"vendor3"}'
    );
    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output queue url",
      '{"event_id":"another request id 2","timestamp":1664584061,"timestamp_formatted":"2022-10-01T00:27:41.186Z","event_name":"IPV_C4_TEST1","component_id":"another entity 2","vendor_id":"vendor4"}'
    );
  });
});

import { handler, EventNameRules } from "./handler";
import { transformCsvToJson } from "./transform";
import { createEvent } from "../../../test-helpers/S3";
import { readJsonFromS3, sendRecord } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

jest.mock("../../shared/utils");
const mockReadJsonFromS3 = readJsonFromS3 as jest.MockedFunction<
  typeof readJsonFromS3
>;

jest.mock("./transform");
const mockTransformCsvToJson = transformCsvToJson as jest.MockedFunction<
  typeof transformCsvToJson
>;

describe("Transformation handler tests", () => {

  const TIME1 = new Date(2022, 11, 5, 17, 0, 0, 0);

  const CLIENT1 = "https://a.client1.eu";
  const CLIENT2 = "https://a.client2.eu";
  const CLIENT_ID1 = "client1";
  const CLIENT_ID2 = "client2";

  const DEFAULT_IDP_CLIENT_LOOKUP = {
    [CLIENT1]: CLIENT_ID1,
    [CLIENT2]: CLIENT_ID2,
  };

  const EVENT_NAME1 = "event1";
  const EVENT_NAME2 = "event2";
  const CLIENT1_RULES = [
    {
      "Minimum Level Of Assurance": "LEVEL_1",
      "Billable Status": "BILLABLE",
      "Event Name": EVENT_NAME1,
    },
    {
      "Minimum Level Of Assurance": "LEVEL_1",
      "Billable Status": "REPEAT-BILLABLE",
      "Event Name": EVENT_NAME2,
    }
  ];
  const DEFAULT_EVENT_NAME_RULES : EventNameRules = {
    [CLIENT1]: CLIENT1_RULES,
  };
  const DEFAULT_EVENT = createEvent([]);
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();

    process.env = {
      ...OLD_ENV,
      OUTPUT_QUEUE_URL: "output-queue-url",
    };
  });

  function buildRow(
    client: String,
    timestamp: Date,
    id: String,
    mloa: String,
    status: String
  ): object {
    return {
      "Idp Entity Id": client,
      Timestamp: timestamp.toLocaleString(),
      "Request Id": id,
      "Minimum Level Of Assurance": mloa,
      "Billable Status": status,
    };
  }

  afterAll(() => {
    process.env = OLD_ENV;
    // console.error = oldConsoleError;
  });

  test("it generates events if given expected data in the csv", async () => {

    mockReadJsonFromS3.mockResolvedValueOnce(DEFAULT_IDP_CLIENT_LOOKUP);
    mockReadJsonFromS3.mockResolvedValueOnce(DEFAULT_EVENT_NAME_RULES);

    const csvRows = [
      buildRow(CLIENT1, TIME1, "id1", "LEVEL_1", "BILLABLE"),
      buildRow(CLIENT1, TIME1, "id2", "LEVEL_1", "REPEAT-BILLABLE"),
    ];
    mockTransformCsvToJson.mockResolvedValue(csvRows);

    await handler(DEFAULT_EVENT);

    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output-queue-url",
      JSON.stringify({
        "event_id": "id1",
        "timestamp": 1670259600,
        "timestamp_formatted": "12/5/2022, 5:00:00 PM",
        "event_name": EVENT_NAME1,
        "client_id": CLIENT_ID1
      }));
    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output-queue-url",
      JSON.stringify({
        "event_id": "id2",
        "timestamp": 1670259600,
        "timestamp_formatted": "12/5/2022, 5:00:00 PM",
        "event_name": EVENT_NAME2,
        "client_id": CLIENT_ID1
      }));
  });

  test("it generates events of type 'unknown' if given unexpected data in the csv", async () => {

    mockReadJsonFromS3.mockResolvedValueOnce(DEFAULT_IDP_CLIENT_LOOKUP);
    mockReadJsonFromS3.mockResolvedValueOnce(DEFAULT_EVENT_NAME_RULES);

    const csvRows = [
      buildRow("ignored client", TIME1, "id1", "LEVEL_1", "BILLABLE"),
      buildRow(CLIENT1, TIME1, "id2", "ignored mloa", "REPEAT-BILLABLE"),
    ];
    mockTransformCsvToJson.mockResolvedValue(csvRows);

    await handler(DEFAULT_EVENT);

    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output-queue-url",
      JSON.stringify({
        "event_id": "id1",
        "timestamp": 1670259600,
        "timestamp_formatted": "12/5/2022, 5:00:00 PM",
        "event_name": "unknown"
      }));
    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output-queue-url",
      JSON.stringify({
        "event_id": "id2",
        "timestamp": 1670259600,
        "timestamp_formatted": "12/5/2022, 5:00:00 PM",
        "event_name": "unknown",
        "client_id": CLIENT_ID1
      }));
  });

  test("it doesn't generate any events it fails to retrieve lookup", async () => {
    const saveImplementation = mockReadJsonFromS3.getMockImplementation();
    try {

      mockReadJsonFromS3.mockImplementation(async () => {
        throw new Error("Error reading from S3")
      });

      await handler(DEFAULT_EVENT);
      fail("Expected exception to be thrown");

    } catch (e) {

      expect((e as Error).message).toEqual("Transformation Handler error");
      expect(mockedSendRecord).not.toHaveBeenCalled();

    } finally {
      mockReadJsonFromS3.mockImplementation(saveImplementation);
    }
  });
});

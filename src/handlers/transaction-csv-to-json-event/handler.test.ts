import { handler } from "./handler";
import { S3Event } from "aws-lambda";
import { fetchS3, sendRecord } from "../../shared/utils";
import { convert } from "./convert";
import { Constructables, Operations } from "./convert/transform-dicts";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedSendRecord = sendRecord as jest.Mock;

jest.mock("./convert");
const mockedConvert = convert as jest.MockedFunction<typeof convert>;

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

  const givenRenamingConfig = [["a", "id"]];
  const givenInferences = [
    {
      field: "event_name",
      rules: [{ given: { id: "one", color: "red" }, inferValue: "TEST_EVENT" }],
      defaultValue: "Unknown",
    },
  ];
  const givenTransformations = [
    {
      inputKey: "timestamp",
      outputKey: "timestamp",
      condition: /^\d{10}$/,
      steps: [
        {
          operation: Operations.construct,
          parameter: Constructables.number,
        },
      ],
    },
  ];
  const givenCsv = `a,color,timestamp\none,red,1667262461\ntwo,pink,1667262461`;

  test("should throw error if no output queue set", async () => {
    delete process.env.OUTPUT_QUEUE_URL;
    await expect(handler(givenEvent)).rejects.toThrowError("Output queue");
  });

  test("should throw error if no config bucket set", async () => {
    delete process.env.CONFIG_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError("Config Bucket");
  });

  test("should throw error with failing config lookup", async () => {
    mockedFetchS3.mockRejectedValue("Error reading from S3");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedFetchS3).toHaveBeenCalled();
    expect(mockedConvert).not.toHaveBeenCalled();
  });

  test("should throw error if config is not valid", async () => {
    mockedFetchS3
      .mockReturnValueOnce("Invalid header-row-renaming-map")
      .mockReturnValueOnce("Invalid event-inferences")
      .mockReturnValueOnce("Invalid event-transformation");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedConvert).not.toHaveBeenCalled();
  });

  test("should throw error with failing convert", async () => {
    mockedFetchS3
      .mockResolvedValueOnce(givenRenamingConfig)
      .mockResolvedValueOnce(givenInferences)
      .mockResolvedValueOnce(givenTransformations)
      .mockResolvedValueOnce(givenCsv);

    mockedConvert.mockRejectedValue("Error");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Transaction CSV to Json Event Handler error"
    );
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("should send record if given a valid event and config", async () => {
    mockedFetchS3
      .mockResolvedValueOnce(givenRenamingConfig)
      .mockResolvedValueOnce(givenInferences)
      .mockResolvedValueOnce(givenTransformations)
      .mockResolvedValueOnce(givenCsv);
    mockedConvert.mockResolvedValueOnce([
      {
        id: "one",
        color: "red",
        timestamp: "1667262461",
        event_name: "TEST_EVENT",
      },
      {
        id: "two",
        color: "pink",
        timestamp: "1667262461",
        event_name: "Unknown",
      },
    ]);
    await handler(givenEvent);
    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output queue url",
      '{"id":"one","color":"red","timestamp":1667262461,"event_name":"TEST_EVENT"}'
    );
    expect(mockedSendRecord).toHaveBeenCalledWith(
      "output queue url",
      '{"id":"two","color":"pink","timestamp":1667262461,"event_name":"Unknown"}'
    );
  });
});

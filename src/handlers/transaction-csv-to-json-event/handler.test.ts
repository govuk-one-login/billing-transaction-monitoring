import { handler } from "./handler";
import { S3Event } from "aws-lambda";
import { fetchS3, sendRecord } from "../../shared/utils";
import { Constructables, Operations } from "./convert/transform-dicts";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedSendRecord = sendRecord as jest.Mock;

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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    givenEvent = {
      Records: [
        {
          s3: {
            bucket: {
              name: "test-bucket",
            },
            object: {
              key: "test-obj",
            },
          },
        },
      ],
    } as S3Event;
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  const givenRenamingConfig = JSON.stringify([["a", "id"]]);
  const givenInferences = JSON.stringify([
    {
      field: "event_name",
      rules: [{ given: { id: "one", color: "red" }, inferValue: "TEST_EVENT" }],
      defaultValue: "Unknown",
    },
  ]);
  const givenTransformations = JSON.stringify([
    {
      inputKey: "timestamp",
      outputKey: "timestamp",
      condition: "^\\d{10}$",
      steps: [
        {
          operation: Operations.construct,
          parameter: Constructables.number,
        },
      ],
    },
  ]);
  const givenCsv = `a,color,timestamp\none,red,1667262461\ntwo,pink,1667262461`;

  test("should throw error if no output queue set", async () => {
    delete process.env.OUTPUT_QUEUE_URL;
    await expect(handler(givenEvent)).rejects.toThrowError("Output queue");
  });

  test("should throw error if no config bucket set", async () => {
    delete process.env.CONFIG_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError("Config Bucket");
  });

  test("should throw error if renaming config is not valid", async () => {
    mockedFetchS3
      .mockReturnValueOnce('{"invalid": "config"}')
      .mockReturnValueOnce(givenInferences)
      .mockReturnValueOnce(givenTransformations);
    await expect(handler(givenEvent)).rejects.toThrowError(
      "header-row-renaming-map.json is invalid."
    );
  });

  test("should throw error if inferences config is not valid", async () => {
    mockedFetchS3
      .mockReturnValueOnce(givenRenamingConfig)
      .mockReturnValueOnce('{"invalid": "config"}')
      .mockReturnValueOnce(givenTransformations);
    await expect(handler(givenEvent)).rejects.toThrowError(
      "event-inferences.json is invalid."
    );
  });

  test("should throw error if transformations config is not valid", async () => {
    mockedFetchS3
      .mockReturnValueOnce(givenRenamingConfig)
      .mockReturnValueOnce(givenInferences)
      .mockReturnValueOnce('{"invalid": "config"}');
    await expect(handler(givenEvent)).rejects.toThrowError(
      "event-transformation.json is invalid."
    );
  });

  test("should throw error if config is not valid json", async () => {
    mockedFetchS3
      .mockReturnValueOnce(givenRenamingConfig)
      .mockReturnValueOnce(givenInferences)
      .mockReturnValueOnce("NoSuchKey");
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Config JSON could not be parsed. Received NoSuchKey"
    );
  });

  test("should throw error with failing convert", async () => {
    mockedFetchS3
      .mockResolvedValueOnce(givenRenamingConfig)
      .mockResolvedValueOnce(givenInferences)
      .mockResolvedValueOnce(givenTransformations)
      .mockResolvedValueOnce(`Invalid CSV`);

    await expect(handler(givenEvent)).rejects.toThrowError();
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("should send record if given a valid event and config", async () => {
    mockedFetchS3
      .mockResolvedValueOnce(givenRenamingConfig)
      .mockResolvedValueOnce(givenInferences)
      .mockResolvedValueOnce(givenTransformations)
      .mockResolvedValueOnce(givenCsv);
    await handler(givenEvent);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(
      1,
      "output queue url",
      '{"id":"one","color":"red","timestamp":1667262461,"event_name":"TEST_EVENT"}'
    );
    expect(mockedSendRecord).toHaveBeenNthCalledWith(
      2,
      "output queue url",
      '{"id":"two","color":"pink","timestamp":1667262461,"event_name":"Unknown"}'
    );
  });
});

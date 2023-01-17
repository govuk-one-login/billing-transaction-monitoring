import { handler, transformCsvToJson } from "./handler";
import {createEvent, createS3EventRecord} from "../../../test-helpers/S3";
import {readJsonFromS3, sendRecord} from "../../shared/utils";
import {S3Event} from "aws-lambda";

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

const mockReadJsonFromS3 = readJsonFromS3 as jest.MockedFunction<typeof readJsonFromS3>;
const mockTransformCsvToJson = transformCsvToJson as jest.MockedFunction<typeof transformCsvToJson>;

describe("Transformation handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  const oldConsoleLog = console.log;
  const bucket = "bucket1";
  const filename = "onecsv.csv";

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    console.error = jest.fn();
    console.log = jest.fn();
    mockedSendRecord.mockClear();
    process.env.OUTPUT_QUEUE_URL = "output-queue-url";

    mockReadJsonFromS3.mockResolvedValue((bucket: string, key: string) => {
      if (key === "idp_clients/idp-clients.json") {
        return { "https://a.client3.eu": "client3", "https://a.client4.co.uk": "client4" };
      } else if (key === "idp_event_name_rules/idp-event-name-rules.json") {
        return {
          "https://a.client3.eu": [
            {
              "Minimum Level Of Assurance": "LEVEL_1",
              "Billable Status": "BILLABLE",
              "Event Name": "IPV_C3_TEST1"
            }]
        };
      }
    })



    let mockTransformCsvToJson: jest.Mock;

    mockTransformCsvToJson = jest.fn(() => ({
      promise: jest.fn().mockResolvedValue(rows)
    }));
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
    console.log = oldConsoleLog;
  });

  test("Can't read idp-clients throws error", async () => {
    const event = createEvent([]);
    await handler(event);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Can't read idp-event-name-rules throws error", async () => {
    const event = createEvent([]);
    await handler(event);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("No event generated when Idp Entity Id not found", async () => {
    const event = createEvent([]);
    await handler(event);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Event generated for each row", async () => {
    const rows = [
      {
        'Idp Entity Id': 'https://a.client3.eu',
        Timestamp: '2022-10-01T00:27:41.186Z',
        'Request Id': '_de508237-ab38-48f8-9d8f',
        'Minimum Level Of Assurance': 'LEVEL_1',
        'Billable Status': 'BILLABLE',
        'RP Entity Id': 'https://ab.abc.signin.uk',
      },
      {
        'Idp Entity Id': 'https://a.client3.eu',
        Timestamp: '2022-10-01T01:31:01.713Z',
        'Request Id': '_08b78d68-b196-4184-bf2c',
        'Minimum Level Of Assurance': 'LEVEL_1',
        'Billable Status': 'REPEAT-BILLABLE',
        'RP Entity Id': 'https://ab.abc.signin.uk',
      }];
    const event = createEvent([]);
    await handler(event);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });
});

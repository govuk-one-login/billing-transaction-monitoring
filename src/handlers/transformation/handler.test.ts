import { handler, transformCsvToJson } from "./handler";
import { createEvent, createS3EventRecord } from "../../../test-helpers/S3";
import { readJsonFromS3, sendRecord } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

jest.mock("../../shared/utils");
const mockReadJsonFromS3 = readJsonFromS3 as jest.MockedFunction<
  typeof readJsonFromS3
>;

jest.mock("./handler.ts", () => ({
  ...jest.requireActual("./handler.ts"),
  transformCsvToJson: jest.fn(),
}));

const mockTransformCsvToJson = transformCsvToJson as jest.MockedFn<
  typeof transformCsvToJson
>;
describe("Transformation handler tests", () => {
  const BUCKET = "bucket1";
  const FILENAME = "onecsv.csv";
  const TIME1 = new Date(2022, 11, 5, 17, 0, 0, 0);
  const CLIENT1 = "https://a.client1.eu";
  // const CLIENT2 = "https://a.client2.eu";
  const CLIENT1_RULES = [
    {
      "Minimum Level Of Assurance": "LEVEL_1",
      "Billable Status": "BILLABLE",
      "Event Name": "IPV_C3_TEST1",
    },
    {
      "Minimum Level Of Assurance": "LEVEL_1",
      "Billable Status": "REPEAT-BILLABLE",
      "Event Name": "IPV_C3_S_TEST1",
    },
    {
      "Minimum Level Of Assurance": "LEVEL_2",
      "Billable Status": "BILLABLE",
      "Event Name": "IPV_C3_S_TEST2",
    },
    {
      "Minimum Level Of Assurance": "LEVEL_2",
      "Billable Status": "REPEAT-BILLABLE",
      "Event Name": "IPV_C3_SI_TEST2",
    },
    {
      "Minimum Level Of Assurance": "LEVEL_2",
      "Billable Status": "BILLABLE-UPLIFT",
      "Event Name": "IPV_C3_TEST3",
    },
  ];

  const OLD_ENV = process.env;
  // const oldConsoleError = console.error;

  beforeEach(() => {
    jest.resetAllMocks();
    // console.error = jest.fn();

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
    const rows = [
      buildRow(CLIENT1, TIME1, "id1", "LEVEL_1", "BILLABLE"),
      buildRow(CLIENT1, TIME1, "id2", "LEVEL_1", "REPEAT-BILLABLE"),
    ];
    mockTransformCsvToJson.mockResolvedValue(rows);

    mockReadJsonFromS3.mockResolvedValue({
      "https://a.client1.eu": "client1",
      "https://a.client2.eu": "client2",
    });

    mockReadJsonFromS3.mockResolvedValueOnce({
      CLIENT1: CLIENT1_RULES,
    });
    const validEventRecords = createS3EventRecord(BUCKET, FILENAME);
    const validEvent = createEvent([validEventRecords]);

    const result = await handler(validEvent);
    console.log(result);
    expect(mockedSendRecord).toHaveBeenCalledTimes(2);
  });

  // mockReadJsonFromS3.mockResolvedValue((bucket: string, key: string) => {
  //   if (key === "idp_clients/idp-clients.json") {
  //     return {
  //       "https://a.client3.eu": "client3",
  //       "https://a.client4.co.uk": "client4",
  //     };
  //   } else if (key === "idp_event_name_rules/idp-event-name-rules.json") {
  //     return {
  //       CLIENT1: CLIENT1_RULES,
  //     };
  //   }
  // });

  // const record1 = createS3EventRecord(BUCKET, FILENAME);
  // const event = createEvent([record1]);
  // await handler(event);
  // expect(mockedSendRecord).not.toHaveBeenCalled();

  // test("it doesnt generate any events if given unexpected data in the csv", async () => {});
});

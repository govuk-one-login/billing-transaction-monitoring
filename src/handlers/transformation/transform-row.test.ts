import { buildRow } from "../../../test-helpers/build-rows";
import { sendRecord } from "../../shared/utils";
import { buildEventName } from "./build-event-name";
import { transformRow } from "./transform-row";

jest.mock("./build-event-name");
const mockedBuildEventName = buildEventName as jest.MockedFunction<
  typeof buildEventName
>;

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

describe("Transform Row test", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const outputQueueUrl = "output queue url";
  const idpEntityId1 = "https://a.client1.eu";
  const idpEntityId2 = "https://a.client2.eu";
  const requestId1 = "event-id-1";
  const minLevel1 = "LEVEL_1";
  const status1 = "BILLABLE";
  const rpEntityId1 = "https://entity.id";
  const clientId1 = "client1";
  const clientId2 = "client2";
  const eventName1 = "IPV_EVENT_NAME_1";
  const timestamp = "2022-10-01T00:27:41.186Z";
  const row = buildRow(
    idpEntityId1,
    timestamp,
    requestId1,
    minLevel1,
    status1,
    rpEntityId1
  );
  const client1Rules = [
    {
      "Minimum Level Of Assurance": minLevel1,
      "Billable Status": "BILLABLE",
      "Event Name": eventName1,
    },
  ];
  const eventNameRules = {
    [idpEntityId1]: client1Rules,
  };

  const idpClientLookUp = {
    [idpEntityId1]: clientId1,
    [idpEntityId2]: clientId2,
  };
  test("should throw error with failing buildEventName function", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedBuildEventName.mockImplementation(() => {
      throw mockedError;
    });

    await expect(
      transformRow(row, idpClientLookUp, eventNameRules, outputQueueUrl)
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedBuildEventName).toHaveBeenCalledTimes(1);
    expect(mockedBuildEventName).toHaveBeenCalledWith(
      eventNameRules,
      idpEntityId1,
      row
    );
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("should send record with csv data transformed to event data if no buildEventName failure", async () => {
    mockedBuildEventName.mockResolvedValue(eventName1);

    await transformRow(row, idpClientLookUp, eventNameRules, outputQueueUrl);

    expect(mockedBuildEventName).toHaveBeenCalledTimes(1);
    expect(mockedBuildEventName).toHaveBeenCalledWith(
      eventNameRules,
      idpEntityId1,
      row
    );
    expect(mockedSendRecord).toHaveBeenCalled();
    expect(mockedSendRecord).toHaveBeenCalledWith(
      outputQueueUrl,
      JSON.stringify({
        event_id: requestId1,
        timestamp: 1664584061,
        timestamp_formatted: timestamp,
        event_name: eventName1,
        component_id: rpEntityId1,
        client_id: clientId1,
      })
    );
  });
});

import { buildRow } from "../../../test-helpers/build-rows";
import { getEventNameFromRules } from "./get-event-name-from-rules";
import { processRow } from "./process-row";

jest.mock("./get-event-name-from-rules");
const mockedGetEventNameFromRules =
  getEventNameFromRules as jest.MockedFunction<typeof getEventNameFromRules>;

describe("Process Row test", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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

  test("should send record with csv data transformed to event data if no getEventNameFromRules failure", async () => {
    mockedGetEventNameFromRules.mockReturnValue(eventName1);

    const processedRow = await processRow(row, idpClientLookUp, eventNameRules);

    expect(mockedGetEventNameFromRules).toHaveBeenCalledTimes(1);
    expect(mockedGetEventNameFromRules).toHaveBeenCalledWith(
      eventNameRules,
      idpEntityId1,
      row
    );
    expect(processedRow).toEqual({
      event_id: requestId1,
      timestamp: 1664584061,
      timestamp_formatted: timestamp,
      event_name: eventName1,
      component_id: rpEntityId1,
      client_id: clientId1,
    });
  });
});

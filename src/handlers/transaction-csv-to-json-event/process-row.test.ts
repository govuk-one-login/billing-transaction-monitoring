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

  const idpEntityId1 = "https://a.vendor1.eu";
  const idpEntityId2 = "https://a.vendor2.eu";
  const requestId1 = "event-id-1";
  const minLevel1 = "LEVEL_1";
  const status1 = "BILLABLE";
  const rpEntityId1 = "https://entity.id";
  const vendorId1 = "vendor1";
  const vendorId2 = "vendor2";
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
  const vendor1Rules = [
    {
      "Minimum Level Of Assurance": minLevel1,
      "Billable Status": "BILLABLE",
      "Event Name": eventName1,
    },
  ];
  const eventNameRules = {
    [idpEntityId1]: vendor1Rules,
  };

  const idpVendorLookUp = {
    [idpEntityId1]: vendorId1,
    [idpEntityId2]: vendorId2,
  };

  test("should send record with csv data transformed to event data if no getEventNameFromRules failure", async () => {
    mockedGetEventNameFromRules.mockReturnValue(eventName1);

    const processedRow = await processRow(row, idpVendorLookUp, eventNameRules);

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
      vendor_id: vendorId1,
    });
  });
});

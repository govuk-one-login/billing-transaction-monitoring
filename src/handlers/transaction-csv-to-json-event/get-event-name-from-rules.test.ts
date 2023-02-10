import { buildRow } from "../../../test-helpers/build-rows";
import { getEventNameFromRules } from "./get-event-name-from-rules";

describe("Get Event Name from Rules Test", () => {
  const idpEntityId1 = "https://a.vendor1.eu";
  const idpEntityId2 = "https://a.vendor2.eu";
  const requestId1 = "event-id-1";
  const minLevel1 = "LEVEL_1";
  const status1 = "BILLABLE";
  const rpEntityId1 = "https://entity.id";
  const timestamp = "2022-10-01T00:27:41.186Z";
  const eventName1 = "IPV_EVENT_NAME_1";

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
      "Billable Status": status1,
      "Event Name": eventName1,
    },
  ];
  const eventNameRules = {
    [idpEntityId1]: vendor1Rules,
  };

  test("Should return the correct event name when given correct paramaters", async () => {
    const eventName = getEventNameFromRules(eventNameRules, idpEntityId1, row);
    expect(eventName).toEqual(eventName1);
  });

  test("Should return 'unknown' if there are no rules for the idpEntityId", async () => {
    const eventName = getEventNameFromRules(eventNameRules, idpEntityId2, row);
    expect(eventName).toEqual("Unknown");
  });

  test("Should return 'unknown' if there are rules for the idpEntityId but the data from the CSV does not match the eventNameRules", async () => {
    const row = buildRow(
      idpEntityId1,
      timestamp,
      requestId1,
      minLevel1,
      "NON-BILLABLE",
      rpEntityId1
    );
    const eventName = getEventNameFromRules(eventNameRules, idpEntityId1, row);
    expect(eventName).toEqual("Unknown");
  });
});

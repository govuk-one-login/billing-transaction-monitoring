import { HandlerCtx } from "../../handler-context";
import { formatDate } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { CleanedEventBody } from "./types";

describe("Store transactions businessLogic", () => {
  let givenCtx: HandlerCtx<any, any>;
  let validIncomingCleanedEventBody: CleanedEventBody;

  beforeEach(() => {
    givenCtx = {
      config: {},
      logger: {},
    } as any;

    validIncomingCleanedEventBody = {
      component_id: "some component ID",
      event_name: "VENDOR_1_EVENT_1",
      timestamp: Date.now(),
      event_id: "abc-123-id",
      timestamp_formatted: "the formatted timestamp",
      vendor_id: "some vendor id",
    };
  });

  it("returns the key to store the transaction data", async () => {
    // Arrange
    const expectedDate = new Date(validIncomingCleanedEventBody.timestamp);
    const yearMonthDayFolder = formatDate(expectedDate, "/");
    const expectedKey = `${yearMonthDayFolder}/${validIncomingCleanedEventBody.event_id}.json`;
    // Act
    const result = await businessLogic(validIncomingCleanedEventBody, givenCtx);
    // Assert
    expect(result).toEqual([expectedKey]);
  });
});

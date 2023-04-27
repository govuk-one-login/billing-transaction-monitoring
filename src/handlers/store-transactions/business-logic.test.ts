import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { CleanedEventBody } from "./types";

describe("Store transactions businessLogic", () => {
  let givenCtx: HandlerCtx<any, any>;
  let validIncomingCleanedEventBody: CleanedEventBody;

  it("returns the key to store the transaction data", async () => {
    // Arrange

    givenCtx = {
      config: {},
      logger: {},
    } as any;

    validIncomingCleanedEventBody = {
      component_id: "some component ID",
      event_name: "VENDOR_1_EVENT_1",
      timestamp: 1682587329548,
      event_id: "abc-123-id",
      timestamp_formatted: "the formatted timestamp",
      vendor_id: "some vendor id",
    };

    const expectedKey = "2023/04/27/abc-123-id.json";

    // Act
    const result = await businessLogic(validIncomingCleanedEventBody, givenCtx);

    // Assert
    expect(result).toEqual([expectedKey]);
  });
});

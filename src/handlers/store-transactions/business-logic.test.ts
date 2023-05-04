import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";

describe("Store transactions businessLogic", () => {
  const mockLogger = {
    info: jest.fn(),
  };

  const mockContext = {
    logger: mockLogger,
  } as unknown as HandlerCtx<any, any, any>;

  const mockEvent = {
    component_id: "some component ID",
    event_name: "VENDOR_1_EVENT_1",
    timestamp: 1682587329548,
    event_id: "abc-123-id",
    timestamp_formatted: "the formatted timestamp",
    vendor_id: "some vendor id",
  };

  it("returns the event to be stored", async () => {
    const result = await businessLogic(mockEvent, mockContext);

    expect(result).toEqual([mockEvent]);
  });

  it("Logs the incoming event id", async () => {
    const event = {
      component_id: "some component ID",
      event_name: "VENDOR_1_EVENT_1",
      timestamp: 1682587329548,
      event_id: "abc-123-id",
      timestamp_formatted: "the formatted timestamp",
      vendor_id: "some vendor id",
    };

    await businessLogic(event, mockContext);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(mockEvent.event_id)
    );
  });
});

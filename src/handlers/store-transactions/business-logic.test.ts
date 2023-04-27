import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";

describe("Store transactions businessLogic", () => {
  it("returns the event to be stored", async () => {
    const event = {
      component_id: "some component ID",
      event_name: "VENDOR_1_EVENT_1",
      timestamp: 1682587329548,
      event_id: "abc-123-id",
      timestamp_formatted: "the formatted timestamp",
      vendor_id: "some vendor id",
    };

    const result = await businessLogic(
      event,
      {} as unknown as HandlerCtx<any, any, any>
    );

    expect(result).toEqual([event]);
  });
});

import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";

describe("Filter businessLogic", () => {
  let givenCtx: HandlerCtx<any, any, any>;

  beforeEach(() => {
    givenCtx = {
      config: {
        services: [
          {
            vendor_name: "Skippy's",
            vendor_id: "ven_1",
            service_name: "Tartan Paint",
            service_regex: "SDH[0-9]{0,5} paint",
            event_name: "EXECUTIVE_ENDUNKENING_COMPLETED",
          },
          {
            vendor_name: "Skippy's",
            vendor_id: "ven_1",
            service_name: "Spirit Level Bubbles",
            service_regex: "SDH[0-9]{0,5} bubble",
            event_name: "SPIRIT_CONSUMPTION_EXECUTION_TASK_START",
          },
        ],
      },
    } as any;
  });

  it("returns messages with valid event names", async () => {
    const validRecord = {
      event_name: "EXECUTIVE_ENDUNKENING_COMPLETED",
    };

    const result = await businessLogic(validRecord, givenCtx);

    expect(result).toEqual([validRecord]);
  });

  it("returns messages with valid event names", async () => {
    const ignoredRecord = {
      event_name: "SOME_IGNORED_EVENT_NAME",
    };

    const result = await businessLogic(ignoredRecord, givenCtx);

    expect(result).toEqual([]);
  });
});

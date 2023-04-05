import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { ConfigCache, Env, Message } from "./types";

describe("Filter businessLogic", () => {
  it("returns messages with valid event names", async () => {
    const validRecord1 = {
      event_name: "EXECUTIVE_ENDUNKENING_COMPLETED",
    };
    const validRecord2 = {
      event_name: "SPIRIT_CONSUMPTION_EXECUTION_TASK_START",
    };
    const ignoredRecord = {
      event_name: "SOME_IGNORED_EVENT_NAME",
    };

    const result = await businessLogic({
      messages: [validRecord1, validRecord2, ignoredRecord],
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
    } as unknown as HandlerCtx<Message, Env, ConfigCache>);

    expect(result).toContain(validRecord1);
    expect(result).toContain(validRecord2);
    expect(result).not.toContain(ignoredRecord);
  });
});

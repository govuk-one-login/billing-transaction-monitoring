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
            contract_id: "1",
          },
          {
            vendor_name: "Skippy's",
            vendor_id: "ven_1",
            service_name: "Spirit Level Bubbles",
            service_regex: "SDH[0-9]{0,5} bubble",
            event_name: "SPIRIT_CONSUMPTION_EXECUTION_TASK_START",
            contract_id: "1",
          },
          {
            vendor_name: "Ven1_e1's",
            vendor_id: "ven_1",
            service_name: "Spirit Level Bubbles",
            service_regex: "SDH[0-9]{0,5} bubble",
            event_name: "DL_VENDOR_1_EVENT_1",
            contract_id: "1",
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

  it("returns message with valid event name and DVLA", async () => {
    const validRecord = {
      event_id: "VENDOR_1_EVENT_1_WITH_DVLA",
      event_name: "DL_VENDOR_1_EVENT_1",
      timestamp: 1667401206,
      timestamp_formatted: "2022-11-07T16:00:11.000Z",
      component_id: "IPV",
      restricted: {
        drivingPermit: {
          issuedBy: ["DVLA"],
        },
      },
    };

    const result = await businessLogic(validRecord, givenCtx);
    expect(result).toEqual([validRecord]);
  });

  it("returns message with valid event name and DVA", async () => {
    const validRecord = {
      event_id: "VENDOR_1_EVENT_1_WITH_DVA",
      event_name: "DL_VENDOR_1_EVENT_1",
      timestamp: 1667401206,
      timestamp_formatted: "2022-11-07T16:00:11.000Z",
      component_id: "IPV",
      restricted: {
        drivingPermit: {
          issuedBy: ["DVA"],
        },
      },
    };

    const result = await businessLogic(validRecord, givenCtx);
    expect(result).toEqual([]);
  });
});

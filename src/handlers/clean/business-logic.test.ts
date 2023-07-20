import { HandlerCtx } from "../../handler-context";
import { ConfigElements } from "../../shared/constants";
import { getVendorId } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { IncomingEventBody } from "./types";

jest.mock("../../shared/utils");
const mockedGetVendorId = getVendorId as jest.Mock;

describe("Clean businessLogic", () => {
  let mockedVendorId: string;
  let givenCtx: HandlerCtx<any, any, any>;
  let givenInfoLogger: jest.Mock;
  let givenServicesConfig: any;
  let givenCreditTransformConfig: any;
  let validIncomingEventBody: IncomingEventBody;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedVendorId = "mocked vendor ID";
    mockedGetVendorId.mockReturnValue(mockedVendorId);

    givenInfoLogger = jest.fn();
    givenServicesConfig = "given services config";
    givenCreditTransformConfig = {
      credits: [
        "!If",
        [
          "!Not",
          [
            "!Or",
            ["!Equals", ["!Path", "$..sorted_mate"], ["Not available"]],
            ["!Equals", ["!Path", "$..sorted_mate"], []],
          ],
        ],
        2,
        1,
      ],
    };

    givenCtx = {
      config: {
        [ConfigElements.services]: givenServicesConfig,
        [ConfigElements.eventCleaningTransform]: givenCreditTransformConfig,
      },
      logger: {
        info: givenInfoLogger,
      },
    } as any;

    validIncomingEventBody = {
      component_id: "some component ID",
      event_name: "VENDOR_1_EVENT_1",
      timestamp: 123,
      event_id: "abc-123-id",
      timestamp_formatted: "2023-02-13T09:26:18.000Z",
    };
  });

  test("Clean businessLogic with minimal valid event body", async () => {
    const result = await businessLogic(validIncomingEventBody, givenCtx);

    expect(result).toEqual([
      {
        component_id: validIncomingEventBody.component_id,
        event_name: validIncomingEventBody.event_name,
        timestamp: validIncomingEventBody.timestamp * 1000,
        event_id: validIncomingEventBody.event_id,
        timestamp_formatted: validIncomingEventBody.timestamp_formatted,
        vendor_id: mockedVendorId,
        user: {
          transaction_id: undefined,
        },
        credits: 1,
      },
    ]);
    expect(mockedGetVendorId).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorId).toHaveBeenCalledWith(
      validIncomingEventBody.event_name,
      givenServicesConfig
    );
    expect(givenInfoLogger).toHaveBeenCalledTimes(1);
    expect(givenInfoLogger).toHaveBeenCalledWith(
      `Cleaned event ${validIncomingEventBody.event_id}`
    );
  });

  test("Clean businessLogic with valid event record that has optional values", async () => {
    validIncomingEventBody.vendor_id = "some vendor ID";
    validIncomingEventBody.user = { transaction_id: "some transaction ID" };
    validIncomingEventBody.evidence = { sorted_mate: "123" };

    const result = await businessLogic(validIncomingEventBody, givenCtx);

    expect(result).toEqual([
      {
        component_id: validIncomingEventBody.component_id,
        event_name: validIncomingEventBody.event_name,
        timestamp: validIncomingEventBody.timestamp * 1000,
        event_id: validIncomingEventBody.event_id,
        timestamp_formatted: validIncomingEventBody.timestamp_formatted,
        vendor_id: "some vendor ID",
        user: {
          transaction_id: "some transaction ID",
        },
        credits: 2,
      },
    ]);
    expect(mockedGetVendorId).not.toHaveBeenCalled();
    expect(givenInfoLogger).toHaveBeenCalledTimes(1);
    expect(givenInfoLogger).toHaveBeenCalledWith(
      `Cleaned event ${validIncomingEventBody.event_id}`
    );
  });
});

import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { randomUUID } from "crypto";
import {
  ConfigSyntheticEventsRow,
  SyntheticEventFrequency,
  SyntheticEventType,
} from "../../shared/types";
// import { CleanedEventBody } from "../clean/types";
import { fetchS3, getFromEnv } from "../../shared/utils";

jest.mock("crypto");
const mockedRandomUUID = randomUUID as jest.Mock;

jest.mock("../../shared/utils", () => ({
  ...jest.requireActual("../../shared/utils"),
  fetchS3: jest.fn(),
  getFromEnv: jest.fn(),
}));
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(Date.UTC(2020, 3, 1));
});

afterAll(() => {
  jest.useRealTimers();
});

const eventName = "some event name";

const baseConfigRow = {
  vendor_id: "some vendor id",
  event_name: eventName,
  quantity: 10,
  component_id: "test component id",
};

const getConfigRow = (
  type: SyntheticEventType,
  frequency: SyntheticEventFrequency,
  start: string,
  end: string | undefined
): ConfigSyntheticEventsRow => {
  return {
    ...baseConfigRow,
    start_date: start,
    end_date: end,
    type,
    frequency,
  };
};

const mockLogger = {
  info: jest.fn(),
};

const generateMockContext = (
  rows: ConfigSyntheticEventsRow[]
): HandlerCtx<any, any, any> => {
  return {
    config: {
      syntheticEvents: rows,
    },
    logger: mockLogger,
  } as unknown as HandlerCtx<any, any, any>;
};

const getExtractRow = (
  eventName: string,
  year: string,
  month: string,
  isQuarterly: boolean,
  quantity: number
): string =>
  `{"vendor_id":"vendor1","vendor_name":"Vendor 1","contract_name":"Contract 1","billing_unit_price":"","billing_amount_with_tax":"","billing_price_formatted":"","transaction_price_formatted":"","price_difference":"","billing_quantity":"","quantity_difference":"","price_difference_percentage":"-1234567.03","contract_id":"contract1",` +
  `"year":"${year}","month":"${month}","invoice_is_quarterly":"${isQuarterly}","transaction_quantity":"${quantity}",` +
  `"service_name":"Service for ${eventName}","event_name":"${eventName}"}`;

describe("Synthetic events businessLogic", () => {
  beforeEach(() => {
    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );
    mockedRandomUUID.mockReturnValue("some random id");
    mockedFetchS3.mockResolvedValue("");
  });

  it("generates no events if no scheduled synthetic events", async () => {
    const mockContext = generateMockContext([]);
    const result = await businessLogic(undefined, mockContext);

    expect(result).toEqual([]);
  });

  describe("Fixed synthetic events", () => {
    describe("Monthly frequency", () => {
      const pastStartDate = "2020/02/15";
      const pastEndDate = "2020/02/20";
      const futureStartDate = "2020/04/05";
      const futureEndDate = "2020/04/15";

      it("generates no events if scheduled events are in future", async () => {
        const mockContext = generateMockContext([
          getConfigRow("fixed", "monthly", futureStartDate, futureEndDate),
        ]);
        const result = await businessLogic(undefined, mockContext);

        expect(result).toEqual([]);
      });

      it("generates no events if scheduled events already generated", async () => {
        mockedFetchS3.mockResolvedValue(
          getExtractRow(eventName, "2023", "02", false, 10) +
            "\n" +
            getExtractRow(eventName, "2023", "03", false, 10)
        );
        const mockContext = generateMockContext([
          getConfigRow("fixed", "monthly", pastStartDate, futureEndDate),
        ]);
        const result = await businessLogic(undefined, mockContext);

        expect(result).toEqual([]);
      });

      it("generates no events if scheduled events are in past", async () => {
        const mockContext = generateMockContext([
          getConfigRow("fixed", "monthly", pastStartDate, pastEndDate),
        ]);
        const result = await businessLogic(undefined, mockContext);

        expect(result).toEqual([]);
      });

      // describe("active config", async () => {
      //   mockedFetchS3.mockResolvedValue(
      //     getExtractRow("monthly_already_generated", "2023", "03", false, 10) +
      //       "\n" +
      //       getExtractRow("monthly_partially_generated", "2023", "03", false, 5)
      //   );
      // });
    });
    //
    // const mockEvent: CleanedEventBody = {
    //   component_id: "test component id",
    //   event_name: eventName,
    //   timestamp: 1585699200000,
    //   event_id: "some random id",
    //   timestamp_formatted: "2020-04-01",
    //   vendor_id: "some vendor id",
    //   credits: 5,
    // };
    //
    // it("generates events after start date but with no end date in config", async () => {
    //   const result = await businessLogic(undefined, mockContext);
    //
    //   expect(result).toEqual([mockEvent]);
    // });
    //
    // it("generates no events before start date and with no end date in config", async () => {
    //   const mockContext = generateMockContext([
    //     {
    //       ...baseConfigRow,
    //       start_date: "2049-01-01",
    //       end_date: undefined,
    //     },
    //   ]);
    //   const result = await businessLogic(undefined, mockContext);
    //
    //   expect(result).toEqual([]);
    // });
    //
    // it("generates events when now is between start and end dates in config", async () => {
    //   const mockContext = generateMockContext([
    //     {
    //       ...baseConfigRow,
    //       start_date: "2005-01-01",
    //       end_date: "2049-01-01",
    //     },
    //   ]);
    //   const result = await businessLogic(undefined, mockContext);
    //
    //   expect(result).toEqual([mockEvent]);
    // });
    //
    // it("generates no events when now is not between start and end dates in config", async () => {
    //   const mockContext = generateMockContext([
    //     {
    //       ...baseConfigRow,
    //       start_date: "2005-01-01",
    //       end_date: "2010-01-01",
    //     },
    //   ]);
    //   const result = await businessLogic(undefined, mockContext);
    //
    //   expect(result).toEqual([]);
    // });
  });
});

import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { randomUUID } from "crypto";
import {
  SyntheticEventDefinition,
  SyntheticEventFrequency,
  SyntheticEventType,
} from "../../shared/types";
import { formatDate, getFromEnv } from "../../shared/utils";
import { getDashboardExtract } from "../../frontend/extract-helpers/get-dashboard-extract";
import { FullExtractLineItem } from "../../frontend/extract-helpers/types";
import { CleanedEventBody } from "../clean/types";

jest.mock("crypto");
const mockedRandomUUID = randomUUID as jest.Mock;

jest.mock("../../frontend/extract-helpers/get-dashboard-extract");
const mockedGetDashboardExtract = getDashboardExtract as jest.Mock;
jest.mock("../../shared/utils/env");
const mockedGetFromEnv = getFromEnv as jest.Mock;

const now = new Date("2020-03-02");

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(now);
});

afterAll(() => {
  jest.useRealTimers();
});

const eventName = "some event name";

const baseSyntheticEventDefinition = {
  vendor_id: "some vendor id",
  event_name: eventName,
  shortfall_event_name: eventName + "-shortfall",
  quantity: 10,
  component_id: "test component id",
};

const getSyntheticEventDefinition = (
  type: SyntheticEventType,
  frequency: SyntheticEventFrequency,
  start: string,
  end: string | undefined
): SyntheticEventDefinition => {
  return {
    ...baseSyntheticEventDefinition,
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
  rows: SyntheticEventDefinition[]
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
  isQuarterly: string,
  quantity: string
): FullExtractLineItem => {
  return {
    vendor_id: "some vendor id",
    vendor_name: "Vendor 1",
    contract_name: "Contract 1",
    billing_unit_price: "",
    billing_amount_with_tax: "",
    billing_price_formatted: "",
    transaction_price_formatted: "",
    price_difference: "",
    billing_quantity: "",
    quantity_difference: "",
    price_difference_percentage: "-1234567.03",
    contract_id: "contract1",
    year,
    month,
    invoice_is_quarterly: isQuarterly,
    transaction_quantity: quantity,
    service_name: `Service for ${eventName}`,
    event_name: eventName,
  };
};

const baseExpectedEvent: CleanedEventBody = {
  component_id: "test component id",
  event_name: eventName,
  timestamp: 1585699200000,
  event_id: "some random id",
  timestamp_formatted: "2020-04-01",
  vendor_id: "some vendor id",
  credits: 5,
};

describe("Synthetic events businessLogic", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );
    mockedRandomUUID.mockReturnValue("some random id");
  });

  it("generates no events if no scheduled synthetic events", async () => {
    mockedGetDashboardExtract.mockResolvedValueOnce([]);
    const mockContext = generateMockContext([]);
    const result = await businessLogic({}, mockContext);

    expect(result).toEqual([]);
  });

  describe("Fixed synthetic events", () => {
    describe("Monthly frequency", () => {
      const nowMonthStart = new Date("2020-03-01");
      const pastMonthStart = "2020/02/01";
      const pastActiveStart = "2020/02/15";
      const pastActiveEnd = "2020/02/20";
      const futureActiveStart = "2020/04/05";
      const futureActiveEnd = "2020/04/15";

      test("generates no events if scheduled events are in future", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "monthly",
            futureActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      test("generates no events if scheduled events already generated", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(eventName, "2020", "02", "false", "10"),
          getExtractRow(eventName, "2020", "03", "false", "10"),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "monthly",
            pastActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      it("generates events to fill in a past month if necessary", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "monthly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            timestamp: new Date(pastMonthStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastMonthStart)),
            credits: 10,
          },
        ]);
      });

      it("generates additional events, in case the target number is increased in config", async () => {
        const alreadyGeneratedEventCount = 7;
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(
            eventName,
            "2020",
            "02",
            "false",
            `${alreadyGeneratedEventCount}`
          ),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "monthly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            timestamp: new Date(pastMonthStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastMonthStart)),
            credits: 10 - alreadyGeneratedEventCount,
          },
        ]);
      });

      it("generates events to fill in all months up to the present time but no further", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "monthly",
            pastActiveStart,
            undefined
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            timestamp: new Date(pastMonthStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastMonthStart)),
            credits: 10,
          },
          {
            ...baseExpectedEvent,
            timestamp: nowMonthStart.getTime(),
            timestamp_formatted: formatDate(nowMonthStart),
            credits: 10,
          },
        ]);
      });
    });

    describe("Quarterly frequency", () => {
      const nowQuarterStart = new Date("2020-01-01");
      const pastQuarterStart = "2019/10/01";
      const pastActiveStart = "2019/11/15";
      const pastActiveEnd = "2019/12/15";
      const futureActiveStart = "2020/04/05";
      const futureActiveEnd = "2020/05/15";

      test("generates no events if scheduled events are in future", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "quarterly",
            futureActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      test("generates no events if scheduled events already generated", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(eventName, "2019", "10", "true", "10"),
          getExtractRow(eventName, "2020", "01", "true", "10"),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "quarterly",
            pastActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      it("generates events to fill in a past quarter if necessary", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "quarterly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            timestamp: new Date(pastQuarterStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastQuarterStart)),
            credits: 10,
          },
        ]);
      });

      it("generates additional events, in case the target number is increased in config", async () => {
        const alreadyGeneratedEventCount = 7;
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(
            eventName,
            "2019",
            "10",
            "true",
            `${alreadyGeneratedEventCount}`
          ),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "quarterly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            timestamp: new Date(pastQuarterStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastQuarterStart)),
            credits: 10 - alreadyGeneratedEventCount,
          },
        ]);
      });

      it("generates events up to the present time but no further", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "fixed",
            "quarterly",
            pastActiveStart,
            undefined
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            timestamp: new Date(pastQuarterStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastQuarterStart)),
            credits: 10,
          },
          {
            ...baseExpectedEvent,
            timestamp: nowQuarterStart.getTime(),
            timestamp_formatted: formatDate(nowQuarterStart),
            credits: 10,
          },
        ]);
      });
    });
  });

  describe("Shortfall synthetic events", () => {
    describe("Monthly frequency", () => {
      const pastMonthStart = "2020/02/01";
      const pastActiveStart = "2020/02/15";
      const pastActiveEnd = "2020/02/20";
      const futureActiveStart = "2020/04/05";
      const futureActiveEnd = "2020/04/15";

      test("generates no events if scheduled events are in future", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "monthly",
            futureActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      test("generates no events if scheduled events already generated", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(eventName, "2020", "02", "false", "10"),
          getExtractRow(eventName, "2020", "03", "false", "10"),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "monthly",
            pastActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      it("generates events to fill in a past month if necessary", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "monthly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            event_name: eventName + "-shortfall",
            timestamp: new Date(pastMonthStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastMonthStart)),
            credits: 10,
          },
        ]);
      });

      it("generates additional events to meet a shortfall of existing events", async () => {
        const alreadyGeneratedEventCount = 7;
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(
            eventName,
            "2020",
            "02",
            "false",
            `${alreadyGeneratedEventCount}`
          ),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "monthly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            event_name: eventName + "-shortfall",
            timestamp: new Date(pastMonthStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastMonthStart)),
            credits: 10 - alreadyGeneratedEventCount,
          },
        ]);
      });

      it("generates events to fill in all months up to the present time but no further", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "monthly",
            pastActiveStart,
            undefined
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            event_name: eventName + "-shortfall",
            timestamp: new Date(pastMonthStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastMonthStart)),
            credits: 10,
          },
        ]);
      });
    });

    describe("Quarterly frequency", () => {
      const pastQuarterStart = "2019/10/01";
      const pastActiveStart = "2019/11/15";
      const pastActiveEnd = "2019/12/15";
      const futureActiveStart = "2020/04/05";
      const futureActiveEnd = "2020/05/15";

      test("generates no events if scheduled events are in future", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "quarterly",
            futureActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      test("generates no events if scheduled events already generated", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(eventName, "2019", "10", "true", "10"),
          getExtractRow(eventName, "2020", "01", "true", "10"),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "quarterly",
            pastActiveStart,
            futureActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([]);
      });

      it("generates events to fill in a past quarter if necessary", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "quarterly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            event_name: eventName + "-shortfall",
            timestamp: new Date(pastQuarterStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastQuarterStart)),
            credits: 10,
          },
        ]);
      });

      it("generates additional events, in case the target number is increased in config", async () => {
        const alreadyGeneratedEventCount = 7;
        mockedGetDashboardExtract.mockResolvedValueOnce([
          getExtractRow(
            eventName,
            "2019",
            "10",
            "true",
            `${alreadyGeneratedEventCount}`
          ),
        ]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "quarterly",
            pastActiveStart,
            pastActiveEnd
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            event_name: eventName + "-shortfall",
            timestamp: new Date(pastQuarterStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastQuarterStart)),
            credits: 10 - alreadyGeneratedEventCount,
          },
        ]);
      });

      it("generates events up to the present time but no further", async () => {
        mockedGetDashboardExtract.mockResolvedValueOnce([]);
        const mockContext = generateMockContext([
          getSyntheticEventDefinition(
            "shortfall",
            "quarterly",
            pastActiveStart,
            undefined
          ),
        ]);
        const result = await businessLogic({}, mockContext);

        expect(result).toEqual([
          {
            ...baseExpectedEvent,
            event_name: eventName + "-shortfall",
            timestamp: new Date(pastQuarterStart).getTime(),
            timestamp_formatted: formatDate(new Date(pastQuarterStart)),
            credits: 10,
          },
        ]);
      });
    });
  });
});

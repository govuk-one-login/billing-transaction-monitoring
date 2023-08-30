import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { randomUUID } from "crypto";

jest.mock("crypto");
const mockedRandomUUID = randomUUID as jest.Mock;

describe("Synthetic events businessLogic", () => {
  const mockLogger = {
    info: jest.fn(),
  };

  mockedRandomUUID.mockReturnValue("some random id");

  const generateMockContext = (
    startDate: Date,
    endDate: Date | undefined,
    frequency: string
  ): HandlerCtx<any, any, any> => {
    return {
      config: {
        syntheticEvents: [
          {
            vendor_id: "some vendor id",
            event_name: "some event name",
            quantity: 5,
            start_date: startDate,
            end_date: endDate,
            frequency,
            component_id: "test component id",
          },
        ],
      },
      logger: mockLogger,
    } as unknown as HandlerCtx<any, any, any>;
  };

  const mockEvent = {
    component_id: "test component id",
    event_name: "some event name",
    timestamp: 1682587329548,
    event_id: "some random id",
    timestamp_formatted: "the formatted timestamp",
    vendor_id: "some vendor id",
    credits: 5,
  };

  it("generates events after start date but with no end date in config", async () => {
    const mockContext = generateMockContext(
      new Date("2005-01-01"),
      undefined,
      "monthly"
    );
    const result = await businessLogic(undefined, mockContext);

    expect(result).toEqual([mockEvent]);
  });

  it("generates no events before start date and with no end date in config", async () => {
    const mockContext = generateMockContext(
      new Date("2049-01-01"),
      undefined,
      "monthly"
    );
    const result = await businessLogic(undefined, mockContext);

    expect(result).toEqual([]);
  });

  it("generates events when now is between start and end dates in config", async () => {
    const mockContext = generateMockContext(
      new Date("2005-01-01"),
      new Date("2049-01-01"),
      "monthly"
    );
    const result = await businessLogic(undefined, mockContext);

    expect(result).toEqual([mockEvent]);
  });

  it("generates no events when now is not between start and end dates in config", async () => {
    const mockContext = generateMockContext(
      new Date("2005-01-01"),
      new Date("2010-01-01"),
      "monthly"
    );
    const result = await businessLogic(undefined, mockContext);

    expect(result).toEqual([]);
  });

  it("generates no events when frequency is not monthly", async () => {
    const mockContext = generateMockContext(
      new Date("2005-01-01"),
      undefined,
      "daily"
    );
    const result = await businessLogic(undefined, mockContext);

    expect(result).toEqual([]);
  });
});

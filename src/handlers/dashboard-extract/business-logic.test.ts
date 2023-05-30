import { HandlerCtx } from "../../handler-context";
import { ResultSet } from "@aws-sdk/client-athena";
import { fetchMonthlyData } from "./fetch-monthly-data";

describe("Store transactions businessLogic", () => {
  const mockLogger = {
    info: jest.fn(),
  };

  const mockContext = {
    logger: mockLogger,
  } as unknown as HandlerCtx<any, any, any>;

  test("Column headers missing", async () => {
    const resultSet = async (): Promise<ResultSet> => {
      return {
        Rows: [
          {
            // Missing data
          },
          {
            Data: [{ VarCharValue: "valueA1" }],
          },
        ],
      };
    };

    await expect(
      fetchMonthlyData(resultSet)(undefined as never, mockContext)
    ).rejects.toThrow("No column headers found");
  });

  test("Column header missing", async () => {
    const resultSet = async (): Promise<ResultSet> => {
      return {
        Rows: [
          {
            Data: [
              { VarCharValue: "column1" },
              {}, // Missing value
            ],
          },
          {
            Data: [{ VarCharValue: "valueA1" }],
          },
        ],
      };
    };

    await expect(
      fetchMonthlyData(resultSet)(undefined as never, mockContext)
    ).rejects.toThrow("Column header missing");
  });

  test("Row missing", async () => {
    const resultSet = async (): Promise<ResultSet> => {
      return {
        Rows: [
          {
            Data: [{ VarCharValue: "column1" }],
          },
          {
            // Missing data
          },
        ],
      };
    };

    await expect(
      fetchMonthlyData(resultSet)(undefined as never, mockContext)
    ).rejects.toThrow("Row missing");
  });

  test("Happy path with valid data", async () => {
    const resultSet = async (): Promise<ResultSet> => {
      return {
        Rows: [
          {
            Data: [
              { VarCharValue: "column1" },
              { VarCharValue: "column2" },
              { VarCharValue: "column3" },
            ],
          },
          {
            Data: [
              { VarCharValue: "valueA1" },
              { VarCharValue: "valueA2" },
              { VarCharValue: "valueA3" },
            ],
          },
          {
            Data: [
              { VarCharValue: "valueB1" },
              { VarCharValue: "valueB2" },
              {}, // Missing value should be replaced with ""
            ],
          },
        ],
      };
    };

    const expectedResults = [
      '{"column1":"valueA1","column2":"valueA2","column3":"valueA3"}\n' +
        '{"column1":"valueB1","column2":"valueB2","column3":""}',
    ];

    const result = await fetchMonthlyData(resultSet)(
      undefined as never,
      mockContext
    );
    expect(result).toEqual(expectedResults);
  });
});

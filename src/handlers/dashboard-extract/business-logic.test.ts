import { HandlerCtx } from "../../handler-context";
import { ResultSet } from "@aws-sdk/client-athena";
import { businessLogic } from "./business-logic";
import { fetchViewData } from "./fetch-view-data";

jest.mock("./fetch-view-data");
const mockedFetchViewData = fetchViewData as jest.Mock;

describe("Dashboard extract businessLogic", () => {
  const mockLogger = {
    info: jest.fn(),
  };

  const mockContext = {
    logger: mockLogger,
  } as unknown as HandlerCtx<any, any, any>;

  test("Column headers missing", async () => {
    const resultSet: ResultSet = {
      Rows: [
        {
          // Missing data
        },
        {
          Data: [{ VarCharValue: "valueA1" }],
        },
      ],
    };
    mockedFetchViewData.mockResolvedValue(resultSet);

    await expect(businessLogic(undefined, mockContext)).rejects.toThrow(
      "No column headers found"
    );
  });

  test("Column header missing", async () => {
    const resultSet: ResultSet = {
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
    mockedFetchViewData.mockResolvedValue(resultSet);

    await expect(businessLogic(undefined, mockContext)).rejects.toThrow(
      "Column header missing"
    );
  });

  test("Row missing", async () => {
    const resultSet: ResultSet = {
      Rows: [
        {
          Data: [{ VarCharValue: "column1" }],
        },
        {
          // Missing data
        },
      ],
    };
    mockedFetchViewData.mockResolvedValue(resultSet);

    await expect(businessLogic(undefined, mockContext)).rejects.toThrow(
      "Row missing"
    );
  });

  test("Happy path with valid data", async () => {
    const resultSet: ResultSet = {
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
    mockedFetchViewData.mockResolvedValue(resultSet);

    const expectedResults = [
      '{"column1":"valueA1","column2":"valueA2","column3":"valueA3"}\n' +
        '{"column1":"valueB1","column2":"valueB2","column3":""}',
    ];

    const result = await businessLogic(undefined, mockContext);
    expect(result).toEqual(expectedResults);
  });
});

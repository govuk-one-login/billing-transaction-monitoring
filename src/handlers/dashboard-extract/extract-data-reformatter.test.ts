import { ResultSet } from "@aws-sdk/client-athena";
import { ExtractDataReformatter } from "./extract-data-reformatter";

jest.mock("aws-sdk");

jest.mock("../../shared/utils/logger");

describe("Extract data reformatter test", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

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

    const reformatter = new ExtractDataReformatter();
    await expect(reformatter.getExtractData(resultSet)).rejects.toThrow(
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

    const reformatter = new ExtractDataReformatter();
    await expect(reformatter.getExtractData(resultSet)).rejects.toThrow(
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

    const reformatter = new ExtractDataReformatter();
    await expect(reformatter.getExtractData(resultSet)).rejects.toThrow(
      "Row missing"
    );
  });

  test("Row value missing", async () => {
    const resultSet: ResultSet = {
      Rows: [
        {
          Data: [{ VarCharValue: "column1" }],
        },
        {
          Data: [{ VarCharValue: "valueA1" }],
        },
        {
          Data: [
            {}, // missing value
          ],
        },
      ],
    };

    const reformatter = new ExtractDataReformatter();
    await expect(reformatter.getExtractData(resultSet)).rejects.toThrow(
      "Cell value missing"
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
            { VarCharValue: "valueB3" },
          ],
        },
      ],
    };

    const expectedResults =
      '{"column1":"valueA1","column2":"valueA2","column3":"valueA3"}\n' +
      '{"column1":"valueB1","column2":"valueB2","column3":"valueB3"}';

    const reformatter = new ExtractDataReformatter();
    const result = await reformatter.getExtractData(resultSet);
    expect(result).toEqual(expectedResults);
  });
});

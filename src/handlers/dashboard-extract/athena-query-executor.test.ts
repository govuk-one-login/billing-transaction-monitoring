import { Athena } from "aws-sdk";
import { AthenaQueryExecutor } from "./athena-query-executor";

jest.mock("aws-sdk");

jest.mock("../../shared/utils/logger");

describe("Pdf Extract handler test", () => {
  const OLD_ENV = process.env;

  const queryResult = {
    Rows: [{ VarCharValue: "foo" }],
  };
  const queryResultSet = {
    ResultSet: { ...queryResult },
  };

  let mockStartQueryExecution: jest.Mock;
  let mockStartQueryExecutionPromise: jest.Mock;
  let mockGetQueryExecution: jest.Mock;
  let mockGetQueryExecutionPromise: jest.Mock;
  let mockGetQueryResults: jest.Mock;
  let mockGetQueryResultsPromise: jest.Mock;
  let givenAthena: Athena;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.DATABASE_NAME = "Database name";
    process.env.RESULTS_BUCKET = "Results bucket";
    process.env.STORAGE_BUCKET = "Storage bucket";

    mockStartQueryExecutionPromise = jest.fn(() => ({
      QueryExecutionId: "Execution ID",
    }));
    mockStartQueryExecution = jest.fn(() => ({
      promise: mockStartQueryExecutionPromise,
    }));

    mockGetQueryExecutionPromise = jest.fn();
    mockGetQueryExecutionPromise
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "QUEUED" } } })
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "RUNNING" } } })
      .mockReturnValueOnce({
        QueryExecution: { Status: { State: "SUCCEEDED" } },
      });
    mockGetQueryExecution = jest.fn(() => ({
      promise: mockGetQueryExecutionPromise,
    }));

    mockGetQueryResultsPromise = jest.fn(() => queryResultSet);
    mockGetQueryResults = jest.fn(() => ({
      promise: mockGetQueryResultsPromise,
    }));

    givenAthena = {
      startQueryExecution: mockStartQueryExecution,
      getQueryExecution: mockGetQueryExecution,
      getQueryResults: mockGetQueryResults,
    } as any;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("No query execution id returned", async () => {
    mockStartQueryExecutionPromise.mockReturnValue({});

    const executor = new AthenaQueryExecutor(givenAthena);

    const resultPromise = executor.fetchResults("some sql string");
    await expect(resultPromise).rejects.toThrow("Failed to start execution");
    expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockGetQueryExecution).not.toHaveBeenCalled();
    expect(mockGetQueryResults).not.toHaveBeenCalled();
  });

  test("Query execution returns failure", async () => {
    // Make it return queued and running before failing, just for good measure.
    mockGetQueryExecutionPromise
      .mockReset()
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "QUEUED" } } })
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "RUNNING" } } })
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "FAILED" } } });

    const executor = new AthenaQueryExecutor(givenAthena);

    const resultPromise = executor.fetchResults("some sql string");
    await expect(resultPromise).rejects.toThrow("Query execution failed");
    expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockGetQueryExecution).toHaveBeenCalledTimes(3);
    expect(mockGetQueryResults).not.toHaveBeenCalled();
  });

  test("Query execution succeeds in default case", async () => {
    const executor = new AthenaQueryExecutor(givenAthena);

    const resultPromise = executor.fetchResults("some sql string");
    await expect(resultPromise).resolves.toEqual(queryResult);
    expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockGetQueryExecution).toHaveBeenCalledTimes(3);
    expect(mockGetQueryResults).toHaveBeenCalledTimes(1);
  });
});

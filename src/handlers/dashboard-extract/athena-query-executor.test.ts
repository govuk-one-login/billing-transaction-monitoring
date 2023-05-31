import { Athena } from "aws-sdk";
import { AthenaQueryExecutor } from "./athena-query-executor";

jest.mock("aws-sdk");

jest.mock("../../shared/utils/logger");

describe("Pdf Extract handler test", () => {
  const queryResult = {
    Rows: [{ VarCharValue: "foo" }],
  };
  const queryResultSet = {
    ResultSet: { ...queryResult },
  };

  const QUERY_RESULTS_BUCKET = "Query results bucket";

  let mockStartQueryExecution: jest.Mock;
  let mockStartQueryExecutionPromise: jest.Mock;
  let mockGetQueryExecution: jest.Mock;
  let mockGetQueryExecutionPromise: jest.Mock;
  let mockGetQueryResults: jest.Mock;
  let mockGetQueryResultsPromise: jest.Mock;
  let givenAthena: Athena;

  beforeEach(() => {
    mockStartQueryExecutionPromise = jest
      .fn()
      .mockResolvedValue({ QueryExecutionId: "Execution ID" });
    mockStartQueryExecution = jest.fn(() => ({
      promise: mockStartQueryExecutionPromise,
    }));

    mockGetQueryExecutionPromise = jest
      .fn()
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "QUEUED" } } })
      .mockReturnValueOnce({ QueryExecution: { Status: { State: "RUNNING" } } })
      .mockReturnValueOnce({
        QueryExecution: { Status: { State: "SUCCEEDED" } },
      });
    mockGetQueryExecution = jest.fn(() => ({
      promise: mockGetQueryExecutionPromise,
    }));

    mockGetQueryResultsPromise = jest.fn().mockResolvedValue(queryResultSet);
    mockGetQueryResults = jest.fn(() => ({
      promise: mockGetQueryResultsPromise,
    }));

    givenAthena = {
      startQueryExecution: mockStartQueryExecution,
      getQueryExecution: mockGetQueryExecution,
      getQueryResults: mockGetQueryResults,
    } as any;
  });

  test("No query execution id returned", async () => {
    mockStartQueryExecutionPromise.mockReturnValue({});

    const executor = new AthenaQueryExecutor(givenAthena, QUERY_RESULTS_BUCKET);

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

    const executor = new AthenaQueryExecutor(givenAthena, QUERY_RESULTS_BUCKET);

    const resultPromise = executor.fetchResults("some sql string");
    await expect(resultPromise).rejects.toThrow("Query execution failed");
    expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockGetQueryExecution).toHaveBeenCalledTimes(3);
    expect(mockGetQueryResults).not.toHaveBeenCalled();
  });

  test("Query execution succeeds in default case", async () => {
    const executor = new AthenaQueryExecutor(givenAthena, QUERY_RESULTS_BUCKET);

    const resultPromise = executor.fetchResults("some sql string");
    await expect(resultPromise).resolves.toEqual(queryResult);
    expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockGetQueryExecution).toHaveBeenCalledTimes(3);
    expect(mockGetQueryResults).toHaveBeenCalledTimes(1);
  });
});

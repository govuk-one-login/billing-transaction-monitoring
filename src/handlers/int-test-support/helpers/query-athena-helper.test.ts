import {
  getQueryExecutionStatus,
  startQueryExecutionCommand,
  getQueryResults,
} from "./athenaHelper";
import { resourcePrefix } from "./envHelper";
import { queryAthena } from "./queryHelper";

jest.mock("./athenaHelper");
const mockedGetQueryExecutionStatus = getQueryExecutionStatus as jest.Mock;
const mockedStartQueryExecutionCommand =
  startQueryExecutionCommand as jest.Mock;
const mockedGetQueryResults = getQueryResults as jest.Mock;

const expectedResults = [{ id: 1, name: test }];

describe("queryAthena", () => {
  const prefix = resourcePrefix();
  const databaseName = `${prefix}-calculations`;
  jest.setTimeout(35000);
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should execute a query and return the results", async () => {
    const queryId = "test123";
    mockedStartQueryExecutionCommand.mockResolvedValue(queryId);
    mockedGetQueryExecutionStatus.mockResolvedValueOnce({
      state: "SUCCEEDED",
    } as any);
    mockedGetQueryResults.mockResolvedValue(expectedResults);

    const queryString = "Select * from test";
    const results = await queryAthena(queryString);
    expect(mockedStartQueryExecutionCommand).toHaveBeenCalledWith({
      databaseName,
      queryString,
    });
    expect(mockedStartQueryExecutionCommand).toHaveBeenCalledTimes(1);
    expect(mockedGetQueryExecutionStatus).toHaveBeenCalledWith(queryId);
    expect(mockedGetQueryExecutionStatus).toHaveBeenCalledTimes(1);
    expect(mockedGetQueryResults).toHaveBeenCalledWith(queryId);
    expect(results).toEqual(expectedResults);
  });

  it("should retry if query execution fails due to NoSuchKey error", async () => {
    const initialQueryId = "test123";
    const newQueryId = "newQueryId";
    mockedStartQueryExecutionCommand.mockResolvedValueOnce(initialQueryId);
    mockedStartQueryExecutionCommand.mockResolvedValueOnce(newQueryId);
    mockedGetQueryExecutionStatus.mockResolvedValueOnce({
      state: "FAILED",
      stateChangeReason: "NoSuchKey",
    } as any);
    mockedGetQueryExecutionStatus.mockResolvedValueOnce({
      state: "SUCCEEDED",
    } as any);
    mockedGetQueryResults.mockResolvedValue(expectedResults);

    const queryString = "Select * from test";
    const results = await queryAthena(queryString);
    expect(mockedStartQueryExecutionCommand).toHaveBeenCalledWith({
      databaseName,
      queryString,
    });
    expect(mockedStartQueryExecutionCommand).toHaveBeenCalledTimes(2);
    expect(mockedGetQueryExecutionStatus).toHaveBeenCalledTimes(2);
    expect(mockedGetQueryExecutionStatus).toHaveBeenCalledWith(initialQueryId);
    expect(mockedGetQueryResults).toHaveBeenCalledWith(newQueryId);
    expect(results).toEqual(expectedResults);
  });

  it("should throw error when the query does not succeed within the timeout", async () => {
    const queryId = "test123";
    mockedStartQueryExecutionCommand.mockResolvedValue(queryId);
    mockedGetQueryExecutionStatus.mockResolvedValue({
      state: "RUNNING",
    } as any);

    const queryString = "Select * from test";
    let error: unknown;
    try {
      await queryAthena(queryString);
    } catch (err) {
      error = err;
    }
    expect(mockedStartQueryExecutionCommand).toHaveBeenCalledTimes(1);
    expect(error as Error).toEqual(
      "Query did not succeed within the given timeout"
    );
    expect(mockedGetQueryResults).not.toHaveBeenCalled();
  });
});

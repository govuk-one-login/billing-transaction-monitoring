import { AthenaQueryExecutor } from "./athena";
import { AthenaClient } from "@aws-sdk/client-athena";

describe.skip("Athena", () => {
  let givenAthena: AthenaClient;
  let mockedAthenaGetQueryExecution: jest.Mock;
  let mockedAthenaGetQueryExecutionPromise: jest.Mock;

  describe("Query execution validator", () => {
    const oldSetTimeout = setTimeout;

    beforeEach(() => {
      jest.resetAllMocks();
      global.setTimeout = ((callback: Function) => callback()) as any;

      mockedAthenaGetQueryExecutionPromise = jest.fn(() => ({
        QueryExecution: {
          Status: {
            State: "SUCCEEDED",
          },
        },
      }));

      mockedAthenaGetQueryExecution = jest.fn(() => ({
        promise: mockedAthenaGetQueryExecutionPromise,
      }));

      givenAthena = {
        getQueryExecution: mockedAthenaGetQueryExecution,
      };
    });

    afterAll(() => {
      global.setTimeout = oldSetTimeout;
    });

    test("Query execution validator with query execution retrieval error", async () => {
      const mockedError = new Error("mocked Error");
      mockedAthenaGetQueryExecutionPromise.mockRejectedValue(mockedError);

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledWith({
        QueryExecutionId: givenId,
      });
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
      expect(resultError).toBe(mockedError);
    });

    test("Query execution validator with query execution without state", async () => {
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {},
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
      expect(resultError).toBeInstanceOf(Error);
    });

    test("Query execution validator with query execution with failure state", async () => {
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {
          Status: {
            State: "FAILED",
          },
        },
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
      expect(resultError).toBeInstanceOf(Error);
    });

    test("Query execution validator with query execution with failure state and error message", async () => {
      const mockedErrorMessage = "mocked error message";
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {
          Status: {
            AthenaError: {
              ErrorMessage: mockedErrorMessage,
            },
            State: "FAILED",
          },
        },
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
      expect(resultError).toBeInstanceOf(Error);
      expect((resultError as Error).message).toContain(mockedErrorMessage);
    });

    test("Query execution validator with query execution with cancellation state", async () => {
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {
          Status: {
            State: "CANCELLED",
          },
        },
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
      expect(resultError).toBeInstanceOf(Error);
    });

    test("Query execution validator with query execution with unrecognised state", async () => {
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {
          Status: {
            State: "mocked unrecognised state",
          },
        },
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
      expect(resultError).toBeInstanceOf(Error);
    });

    test("Query execution validator with query execution with queued state", async () => {
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {
          Status: {
            State: "QUEUED",
          },
        },
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(10);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(10);
      expect(resultError).toBeInstanceOf(Error);
    });

    test("Query execution validator with query execution with running state", async () => {
      mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
        QueryExecution: {
          Status: {
            State: "RUNNING",
          },
        },
      });

      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      let resultError;
      try {
        await resultValidator.validate(givenId);
      } catch (error) {
        resultError = error;
      }

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(10);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(10);
      expect(resultError).toBeInstanceOf(Error);
    });

    test("Query execution validator with query execution with successful state", async () => {
      const givenId = "given ID";

      const resultValidator = new AthenaQueryExecutor(givenAthena);
      await resultValidator.validate(givenId);

      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    });
  });

  describe("Fetch Results", () => {
    const queryResult = {
      Rows: [{ VarCharValue: "foo" }],
    };
    const queryResultSet = {
      ResultSet: { ...queryResult },
    };

    const QUERY_RESULTS_BUCKET = "Query results bucket";

    let mockStartQueryExecution: jest.Mock;
    let mockStartQueryExecutionPromise: jest.Mock;
    let mockGetQueryResults: jest.Mock;
    let mockGetQueryResultsPromise: jest.Mock;

    beforeEach(() => {
      mockStartQueryExecutionPromise = jest
        .fn()
        .mockResolvedValue({ QueryExecutionId: "Execution ID" });
      mockStartQueryExecution = jest.fn(() => ({
        promise: mockStartQueryExecutionPromise,
      }));

      mockedAthenaGetQueryExecutionPromise = jest
        .fn()
        .mockResolvedValueOnce({
          QueryExecution: { Status: { State: "QUEUED" } },
        })
        .mockResolvedValueOnce({
          QueryExecution: { Status: { State: "RUNNING" } },
        })
        .mockResolvedValueOnce({
          QueryExecution: { Status: { State: "SUCCEEDED" } },
        });
      mockedAthenaGetQueryExecution = jest.fn(() => ({
        promise: mockedAthenaGetQueryExecutionPromise,
      }));

      mockGetQueryResultsPromise = jest.fn().mockResolvedValue(queryResultSet);
      mockGetQueryResults = jest.fn(() => ({
        promise: mockGetQueryResultsPromise,
      }));

      givenAthena = {
        startQueryExecution: mockStartQueryExecution,
        getQueryExecution: mockedAthenaGetQueryExecution,
        getQueryResults: mockGetQueryResults,
      } as any;
    });

    test("No query execution id returned", async () => {
      mockStartQueryExecutionPromise.mockReturnValue({});

      const executor = new AthenaQueryExecutor(givenAthena);

      const resultPromise = executor.fetchResults(
        "some sql string",
        QUERY_RESULTS_BUCKET
      );
      await expect(resultPromise).rejects.toThrow("Failed to start execution");
      expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecution).not.toHaveBeenCalled();
      expect(mockGetQueryResults).not.toHaveBeenCalled();
    });

    test("Query execution returns failure", async () => {
      // Make it return queued and running before failing, just for good measure.
      mockedAthenaGetQueryExecutionPromise
        .mockReset()
        .mockResolvedValueOnce({
          QueryExecution: { Status: { State: "QUEUED" } },
        })
        .mockResolvedValueOnce({
          QueryExecution: { Status: { State: "RUNNING" } },
        })
        .mockResolvedValueOnce({
          QueryExecution: { Status: { State: "FAILED" } },
        });

      const executor = new AthenaQueryExecutor(givenAthena);

      const resultPromise = executor.fetchResults(
        "some sql string",
        QUERY_RESULTS_BUCKET
      );
      await expect(resultPromise).rejects.toThrow("Query execution failed");
      expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(3);
      expect(mockGetQueryResults).not.toHaveBeenCalled();
    });

    test("Query execution succeeds in default case", async () => {
      const executor = new AthenaQueryExecutor(givenAthena);

      const resultPromise = executor.fetchResults(
        "some sql string",
        QUERY_RESULTS_BUCKET
      );
      await expect(resultPromise).resolves.toEqual(queryResult);
      expect(mockStartQueryExecution).toHaveBeenCalledTimes(1);
      expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(3);
      expect(mockGetQueryResults).toHaveBeenCalledTimes(1);
    });
  });
});

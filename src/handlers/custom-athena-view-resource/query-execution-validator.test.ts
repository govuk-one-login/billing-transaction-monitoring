import { Athena } from "aws-sdk";
import { QueryExecutionValidator } from "./query-execution-validator";

describe("Query execution validator", () => {
  let mockedAthenaGetQueryExecution: jest.Mock;
  let mockedAthenaGetQueryExecutionPromise: jest.Mock;
  let givenAthena: Athena;
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

    givenAthena = { getQueryExecution: mockedAthenaGetQueryExecution } as any;
  });

  afterAll(() => {
    global.setTimeout = oldSetTimeout;
  });

  test("Query execution validator with query execution retrieval error", async () => {
    const mockedError = new Error("mocked Error");
    mockedAthenaGetQueryExecutionPromise.mockRejectedValue(mockedError);

    const givenId = "given ID";

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
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

    const resultValidator = new QueryExecutionValidator(givenAthena);
    await resultValidator.validate(givenId);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
  });
});

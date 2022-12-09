import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { Athena } from "aws-sdk";
import { sendCustomResourceResult } from "../../shared/utils";
import { handler } from "./handler";

jest.mock("aws-sdk");
const MockedAthena = Athena as jest.MockedClass<typeof Athena>;

jest.mock("../../shared/utils");
const mockedSendCustomResourceResult =
  sendCustomResourceResult as jest.MockedFunction<
    typeof sendCustomResourceResult
  >;

describe("Custom Athena view resource handler", () => {
  let mockedAthenaGetQueryExecution: jest.Mock;
  let mockedAthenaGetQueryExecutionPromise: jest.Mock;
  let mockedAthenaStartQueryExecution: jest.Mock;
  let mockedAthenaStartQueryExecutionPromise: jest.Mock;
  let mockedConsoleError: jest.Mock;
  let givenContext: Context;
  const oldConsoleError = console.error;
  const oldSetTimeout = setTimeout;
  let validEvent: CloudFormationCustomResourceEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    global.setTimeout = ((callback: Function) => callback()) as any;

    mockedConsoleError = jest.fn();
    console.error = mockedConsoleError;

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

    mockedAthenaStartQueryExecutionPromise = jest.fn(() => ({
      QueryExecutionId: "mocked query execution ID",
    }));

    mockedAthenaStartQueryExecution = jest.fn(() => ({
      promise: mockedAthenaStartQueryExecutionPromise,
    }));

    MockedAthena.mockReturnValue({
      getQueryExecution: mockedAthenaGetQueryExecution,
      startQueryExecution: mockedAthenaStartQueryExecution,
    } as any);

    givenContext = {
      logStreamName: "given context log stream name",
    } as any;

    validEvent = {
      RequestType: "given request type",
      ResourceProperties: {
        View: {
          Database: "given view database",
          Name: "given view name",
          Query: "given view query",
          Workgroup: "given view workgroup",
        },
      },
    } as any;
  });

  afterAll(() => {
    console.error = oldConsoleError;
    global.setTimeout = oldSetTimeout;
  });

  test("Custom Athena view resource handler with no `View`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {},
    } as any;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with `View` not object", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        View: "some string",
      },
    } as any;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with no `View.Database`", async () => {
    const givenEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Database;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with `View.Database` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Database: 1234,
        },
      },
    };

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with no `View.Name`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Name;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with `View.Name` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Name: 1234,
        },
      },
    };

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with no `View.Query`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Query;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with `View.Query` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Query: 1234,
        },
      },
    };

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with no `View.Workgroup`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Workgroup;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with `View.Workgroup` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Workgroup: 1234,
        },
      },
    };

    await handler(givenEvent, givenContext);

    expect(Athena).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecution).not.toHaveBeenCalled();
    expect(mockedAthenaStartQueryExecutionPromise).not.toHaveBeenCalled();
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test('Custom Athena view resource handler with request type "Create"', async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      RequestType: "Create",
    } as any;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaStartQueryExecution).toHaveBeenCalledWith({
      QueryExecutionContext: {
        Database: givenEvent.ResourceProperties.View.Database,
      },
      QueryString: `CREATE OR REPLACE VIEW "${
        givenEvent.ResourceProperties.View.Name as string
      }" AS (${givenEvent.ResourceProperties.View.Query as string})`,
      WorkGroup: givenEvent.ResourceProperties.View.Workgroup,
    });
    expect(mockedAthenaStartQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining("created"),
      status: "SUCCESS",
    });
  });

  test('Custom Athena view resource handler with request type "Delete"', async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      RequestType: "Delete",
    } as any;

    await handler(givenEvent, givenContext);

    expect(MockedAthena).toHaveBeenCalledTimes(1);
    expect(MockedAthena).toHaveBeenCalledWith({ region: "eu-west-2" });
    expect(mockedAthenaStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaStartQueryExecution).toHaveBeenCalledWith({
      QueryExecutionContext: {
        Database: givenEvent.ResourceProperties.View.Database,
      },
      QueryString: `DROP VIEW IF EXISTS "${
        givenEvent.ResourceProperties.View.Name as string
      }"`,
      WorkGroup: givenEvent.ResourceProperties.View.Workgroup,
    });
    expect(mockedAthenaStartQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining("deleted"),
      status: "SUCCESS",
    });
  });

  test('Custom Athena view resource handler with request type "Update"', async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      RequestType: "Update",
    } as any;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaStartQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaStartQueryExecution).toHaveBeenCalledWith({
      QueryExecutionContext: {
        Database: givenEvent.ResourceProperties.View.Database,
      },
      QueryString: `CREATE OR REPLACE VIEW "${
        givenEvent.ResourceProperties.View.Name as string
      }" AS (${givenEvent.ResourceProperties.View.Query as string})`,
      WorkGroup: givenEvent.ResourceProperties.View.Workgroup,
    });
    expect(mockedAthenaStartQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining("updated"),
      status: "SUCCESS",
    });
  });

  test("Custom Athena view resource handler with query execution start error", async () => {
    mockedAthenaStartQueryExecutionPromise.mockRejectedValue(undefined);

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(mockedAthenaGetQueryExecution).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with query execution start result without ID", async () => {
    mockedAthenaStartQueryExecutionPromise.mockResolvedValue({});

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
    expect(mockedAthenaGetQueryExecution).not.toHaveBeenCalled();
  });

  test("Custom Athena view resource handler with query execution retrieval error", async () => {
    mockedAthenaGetQueryExecutionPromise.mockRejectedValue(undefined);

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution without state", async () => {
    mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
      QueryExecution: {},
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution with failure state", async () => {
    mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
      QueryExecution: {
        Status: {
          State: "FAILED",
        },
      },
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution with failure state and error message", async () => {
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

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedConsoleError).toHaveBeenCalledTimes(1);
    expect(String(mockedConsoleError.mock.calls[0][1])).toEqual(
      expect.stringContaining(mockedErrorMessage)
    );
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution with cancellation state", async () => {
    mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
      QueryExecution: {
        Status: {
          State: "CANCELLED",
        },
      },
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution with unrecognised state", async () => {
    mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
      QueryExecution: {
        Status: {
          State: "mocked unrecognised state",
        },
      },
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(1);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution with running state", async () => {
    mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
      QueryExecution: {
        Status: {
          State: "RUNNING",
        },
      },
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(10);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(10);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution with queued state", async () => {
    mockedAthenaGetQueryExecutionPromise.mockResolvedValue({
      QueryExecution: {
        Status: {
          State: "RUNNING",
        },
      },
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaGetQueryExecution).toHaveBeenCalledTimes(10);
    expect(mockedAthenaGetQueryExecutionPromise).toHaveBeenCalledTimes(10);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });
});

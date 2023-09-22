import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { sendCustomResourceResult } from "../../shared/utils";
import { getAthenaViewResourceData } from "./get-athena-view-resource-data";
import { handler } from "./handler";
import { AWS_REGION } from "../../shared/constants";
import { AthenaQueryExecutor } from "../../shared/utils/athenaV3";
import {
  AthenaClient,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";

jest.mock("@aws-sdk/client-athena");
const MockedAthenaClass = AthenaClient as jest.MockedClass<typeof AthenaClient>;
const MockedQueryCommand = StartQueryExecutionCommand as jest.MockedClass<
  typeof StartQueryExecutionCommand
>;

jest.mock("../../shared/utils");
const mockedSendCustomResourceResult =
  sendCustomResourceResult as jest.MockedFunction<
    typeof sendCustomResourceResult
  >;

jest.mock("./get-athena-view-resource-data");
const mockedGetAthenaViewResourceData = getAthenaViewResourceData as jest.Mock;

jest.mock("../../shared/utils/athenaV3");
const MockedQueryExecutionValidator = AthenaQueryExecutor as jest.MockedClass<
  typeof AthenaQueryExecutor
>;

describe("Custom Athena view resource handler", () => {
  let mockedAthena: any;
  let mockedAthenaClientSendFunction: jest.Mock;
  let mockedDatabase: string;
  let mockedName: string;
  let mockedQuery: string;
  let mockedQueryExecutionId: string;
  let mockedQueryExecutionValidatorValidate: jest.Mock;
  let mockedWorkgroup: string;
  let givenContext: Context;
  const oldSetTimeout = setTimeout;
  let validEvent: CloudFormationCustomResourceEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    global.setTimeout = ((callback: Function) => callback()) as any;

    mockedQueryExecutionId = "mocked query execution ID";

    mockedAthenaClientSendFunction = jest.fn(() => ({
      QueryExecutionId: mockedQueryExecutionId,
    }));

    mockedAthena = { send: mockedAthenaClientSendFunction };

    MockedAthenaClass.mockReturnValue(mockedAthena);

    mockedDatabase = "mocked database";
    mockedName = "mocked name";
    mockedQuery = "mocked query";
    mockedWorkgroup = "mocked workgroup";

    mockedGetAthenaViewResourceData.mockReturnValue({
      database: mockedDatabase,
      name: mockedName,
      query: mockedQuery,
      workgroup: mockedWorkgroup,
    });

    mockedQueryExecutionValidatorValidate = jest.fn();

    MockedQueryExecutionValidator.mockReturnValue({
      validate: mockedQueryExecutionValidatorValidate,
    } as any);

    givenContext = { logStreamName: "given context log stream name" } as any;

    validEvent = { RequestType: "given request type" } as any;
  });

  afterAll(() => {
    global.setTimeout = oldSetTimeout;
  });

  test("Custom Athena view resource handler with invalid event", async () => {
    mockedGetAthenaViewResourceData.mockImplementation(() => {
      throw new Error("mocked error");
    });

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedGetAthenaViewResourceData).toHaveBeenCalledTimes(1);
    expect(mockedGetAthenaViewResourceData).toHaveBeenCalledWith(givenEvent);
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

    expect(mockedAthenaClientSendFunction).toHaveBeenCalledTimes(1);
    expect(MockedQueryCommand).toHaveBeenCalledTimes(1);
    expect(MockedQueryCommand).toHaveBeenCalledWith({
      QueryExecutionContext: {
        Database: mockedDatabase,
      },
      QueryString: `CREATE OR REPLACE VIEW "${mockedName}" AS ${mockedQuery}`,
      WorkGroup: mockedWorkgroup,
    });
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining("created"),
      status: "SUCCESS",
      physicalId: "mocked database/mocked workgroup/mocked name",
    });
  });

  test('Custom Athena view resource handler with request type "Delete"', async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      RequestType: "Delete",
    } as any;

    await handler(givenEvent, givenContext);

    expect(MockedAthenaClass).toHaveBeenCalledTimes(1);
    expect(MockedAthenaClass).toHaveBeenCalledWith({ region: AWS_REGION });
    expect(mockedAthenaClientSendFunction).toHaveBeenCalledTimes(1);
    expect(MockedQueryCommand).toHaveBeenCalledTimes(1);
    expect(MockedQueryCommand).toHaveBeenCalledWith({
      QueryExecutionContext: {
        Database: mockedDatabase,
      },
      QueryString: `DROP VIEW IF EXISTS "${mockedName}"`,
      WorkGroup: mockedWorkgroup,
    });
    expect(mockedAthenaClientSendFunction).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining("deleted"),
      status: "SUCCESS",
      physicalId: "mocked database/mocked workgroup/mocked name",
    });
  });

  test('Custom Athena view resource handler with request type "Update"', async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      RequestType: "Update",
    } as any;

    await handler(givenEvent, givenContext);

    expect(mockedAthenaClientSendFunction).toHaveBeenCalledTimes(1);
    expect(MockedQueryCommand).toHaveBeenCalledTimes(1);
    expect(MockedQueryCommand).toHaveBeenCalledWith({
      QueryExecutionContext: {
        Database: mockedDatabase,
      },
      QueryString: `CREATE OR REPLACE VIEW "${mockedName}" AS ${mockedQuery}`,
      WorkGroup: mockedWorkgroup,
    });
    expect(mockedAthenaClientSendFunction).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining("updated"),
      status: "SUCCESS",
      physicalId: "mocked database/mocked workgroup/mocked name",
    });
  });

  test("Custom Athena view resource handler with query execution start error", async () => {
    mockedAthenaClientSendFunction.mockRejectedValue(undefined);

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution start result without ID", async () => {
    mockedAthenaClientSendFunction.mockResolvedValue({});

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });

  test("Custom Athena view resource handler with query execution validation error", async () => {
    mockedQueryExecutionValidatorValidate.mockRejectedValue(undefined);

    const givenEvent = validEvent;

    await handler(givenEvent, givenContext);

    expect(MockedQueryExecutionValidator).toHaveBeenCalledTimes(1);
    expect(MockedQueryExecutionValidator).toHaveBeenCalledWith(mockedAthena);
    expect(mockedQueryExecutionValidatorValidate).toHaveBeenCalledTimes(1);
    expect(mockedQueryExecutionValidatorValidate).toHaveBeenCalledWith(
      mockedQueryExecutionId
    );
    expect(mockedSendCustomResourceResult).toHaveBeenCalledTimes(1);
    expect(mockedSendCustomResourceResult).toHaveBeenCalledWith({
      context: givenContext,
      event: givenEvent,
      reason: expect.stringContaining(givenContext.logStreamName),
      status: "FAILED",
    });
  });
});

import { Context } from "aws-lambda";
import {
  listS3Objects,
  getS3Object,
  deleteS3Objects,
  deleteS3Object,
  getS3Objects,
  checkIfS3ObjectExists,
  putS3Object,
} from "./helpers/s3Helper";
import {
  getRecentCloudwatchLogs,
  checkGivenStringExistsInLogs,
} from "./helpers/cloudWatchHelper";
import {
  getQueryExecutionStatus,
  startQueryExecutionCommand,
  getQueryResults,
} from "./helpers/athenaHelper";
import { createInvoiceInS3 } from "./helpers/mock-data/invoice/helpers";
import { invokeLambda } from "./helpers/lambdaHelper";

export interface TestSupportEvent {
  environment: string;
  config: string;
  command: IntTestHelpers;
  parameters: any;
}

export interface TestSupportReturn {
  success?: boolean;
  successObject?: any;
}

export enum IntTestHelpers {
  getS3Object = "getS3Object",
  getS3Objects = "getS3Objects",
  listS3Objects = "listS3Objects",
  putS3Object = "putS3Object",
  deleteS3Object = "deleteS3Object",
  deleteS3Objects = "deleteS3Objects",
  checkIfS3ObjectExists = "checkIfS3ObjectExists",
  checkGivenStringExistsInLogs = "checkGivenStringExistsInLogs",
  getRecentCloudwatchLogs = "getRecentCloudwatchLogs",
  startQueryExecutionCommand = "startQueryExecutionCommand",
  getQueryExecutionStatus = "getQueryExecutionStatus",
  getQueryResults = "getQueryResults",
  createInvoiceInS3 = "createInvoiceInS3",
  invokeLambda = "invokeLambda",
}

export interface HelperDict {
  [IntTestHelpers.getS3Object]: typeof getS3Object;
  [IntTestHelpers.getS3Objects]: typeof getS3Objects;
  [IntTestHelpers.listS3Objects]: typeof listS3Objects;
  [IntTestHelpers.putS3Object]: typeof putS3Object;
  [IntTestHelpers.deleteS3Object]: typeof deleteS3Object;
  [IntTestHelpers.deleteS3Objects]: typeof deleteS3Objects;
  [IntTestHelpers.checkIfS3ObjectExists]: typeof checkIfS3ObjectExists;
  [IntTestHelpers.checkGivenStringExistsInLogs]: typeof checkGivenStringExistsInLogs;
  [IntTestHelpers.getRecentCloudwatchLogs]: typeof getRecentCloudwatchLogs;
  [IntTestHelpers.startQueryExecutionCommand]: typeof startQueryExecutionCommand;
  [IntTestHelpers.getQueryExecutionStatus]: typeof getQueryExecutionStatus;
  [IntTestHelpers.getQueryResults]: typeof getQueryResults;
  [IntTestHelpers.createInvoiceInS3]: typeof createInvoiceInS3;
  [IntTestHelpers.invokeLambda]: typeof invokeLambda;
}

const functionMap: HelperDict = {
  [IntTestHelpers.getS3Object]: getS3Object,
  [IntTestHelpers.getS3Objects]: getS3Objects,
  [IntTestHelpers.listS3Objects]: listS3Objects,
  [IntTestHelpers.putS3Object]: putS3Object,
  [IntTestHelpers.deleteS3Object]: deleteS3Object,
  [IntTestHelpers.deleteS3Objects]: deleteS3Objects,
  [IntTestHelpers.checkIfS3ObjectExists]: checkIfS3ObjectExists,
  [IntTestHelpers.checkGivenStringExistsInLogs]: checkGivenStringExistsInLogs,
  [IntTestHelpers.getRecentCloudwatchLogs]: getRecentCloudwatchLogs,
  [IntTestHelpers.startQueryExecutionCommand]: startQueryExecutionCommand,
  [IntTestHelpers.getQueryExecutionStatus]: getQueryExecutionStatus,
  [IntTestHelpers.getQueryResults]: getQueryResults,
  [IntTestHelpers.createInvoiceInS3]: createInvoiceInS3,
  [IntTestHelpers.invokeLambda]: invokeLambda,
};

const callFunction = async (
  name: IntTestHelpers,
  parameters: any
): Promise<any> => {
  if (functionMap[name] !== undefined) {
    const func: Function = functionMap[name];
    const ret = await func(parameters);
    return ret;
  }

  throw new Error(`Function '${name}' is not implemented.`);
};

export const handler = async (
  event: TestSupportEvent,
  _context: Context
): Promise<TestSupportReturn> => {
  process.env.ENV_NAME = event.environment;
  process.env.CONFIG_NAME = event.config;

  const retVal = await callFunction(event.command, event.parameters);

  return { success: true, successObject: retVal };
};

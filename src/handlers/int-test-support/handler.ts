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
import { publishToTestTopic } from "./helpers/snsHelper";
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

export interface TestSupportEvent {
  environment: string;
  config: string;
  command: string;
  parameters: any;
}

export interface TestSupportReturn {
  success?: boolean;
  successObject?: any;
}

const functionMap: { [name: string]: Function } = {
  getS3Object,
  getS3Objects,
  listS3Objects,
  putS3Object,
  deleteS3Object,
  deleteS3Objects,
  checkIfS3ObjectExists,
  publishToTestTopic,
  checkGivenStringExistsInLogs,
  getRecentCloudwatchLogs,
  startQueryExecutionCommand,
  getQueryExecutionStatus,
  getQueryResults,
  createInvoiceInS3,
};

const callFunction = async (name: string, parameters: any): Promise<any> => {
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

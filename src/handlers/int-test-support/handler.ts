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
import { publishSNS } from "./helpers/snsHelper";
import { checkGivenStringExistsInLogs } from "./helpers/cloudWatchHelper";
import {
  getQueryExecutionStatus,
  startQueryExecutionCommand,
  getQueryResults,
} from "./helpers/athenaHelper";
import { createInvoiceInS3 } from "./helpers/mock-data/invoice/helpers";

export interface TestSupportEvent {
  environment: string;
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
  publishSNS,
  checkGivenStringExistsInLogs,
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
  context: Context
): Promise<TestSupportReturn> => {
  console.log("Incoming event", event);
  console.log("Context", context);

  process.env.ENV_NAME = event.environment;

  const retVal = await callFunction(event.command, event.parameters);

  return { success: true, successObject: retVal };
};

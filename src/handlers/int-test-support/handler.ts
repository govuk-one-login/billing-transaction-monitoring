import { Context } from "aws-lambda";
import {
  listS3Objects,
  getS3Object,
  deleteS3Objects,
  getS3Objects,
  checkIfS3ObjectExists,
  putS3Object,
  deleteS3ObjectsByPrefix,
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
import { sendRawEmail, sendEmailWithoutAttachments } from "./helpers/sesHelper";

export type SerializableData =
  | string
  | number
  | boolean
  | null
  | SerializableData[]
  | { [key: string]: SerializableData };

export interface TestSupportEvent<T extends IntTestHelpers> {
  environment: string;
  config: string;
  command: T;
  parameters: SerializableData;
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
  deleteS3ObjectsByPrefix = "deleteS3ObjectsByPrefix",
  deleteS3Objects = "deleteS3Objects",
  checkIfS3ObjectExists = "checkIfS3ObjectExists",
  checkGivenStringExistsInLogs = "checkGivenStringExistsInLogs",
  getRecentCloudwatchLogs = "getRecentCloudwatchLogs",
  startQueryExecutionCommand = "startQueryExecutionCommand",
  getQueryExecutionStatus = "getQueryExecutionStatus",
  getQueryResults = "getQueryResults",
  createInvoiceInS3 = "createInvoiceInS3",
  invokeLambda = "invokeLambda",
  sendEmail = "sendEmail",
  sendRawEmail = "sendRawEmail",
}

export interface HelperDict {
  [IntTestHelpers.getS3Object]: typeof getS3Object;
  [IntTestHelpers.getS3Objects]: typeof getS3Objects;
  [IntTestHelpers.listS3Objects]: typeof listS3Objects;
  [IntTestHelpers.putS3Object]: typeof putS3Object;
  [IntTestHelpers.deleteS3ObjectsByPrefix]: typeof deleteS3ObjectsByPrefix;
  [IntTestHelpers.deleteS3Objects]: typeof deleteS3Objects;
  [IntTestHelpers.checkIfS3ObjectExists]: typeof checkIfS3ObjectExists;
  [IntTestHelpers.checkGivenStringExistsInLogs]: typeof checkGivenStringExistsInLogs;
  [IntTestHelpers.getRecentCloudwatchLogs]: typeof getRecentCloudwatchLogs;
  [IntTestHelpers.startQueryExecutionCommand]: typeof startQueryExecutionCommand;
  [IntTestHelpers.getQueryExecutionStatus]: typeof getQueryExecutionStatus;
  [IntTestHelpers.getQueryResults]: typeof getQueryResults;
  [IntTestHelpers.createInvoiceInS3]: typeof createInvoiceInS3;
  [IntTestHelpers.invokeLambda]: typeof invokeLambda;
  [IntTestHelpers.sendEmail]: typeof sendEmailWithoutAttachments;
  [IntTestHelpers.sendRawEmail]: typeof sendRawEmail;
}

const functionMap: HelperDict = {
  [IntTestHelpers.getS3Object]: getS3Object,
  [IntTestHelpers.getS3Objects]: getS3Objects,
  [IntTestHelpers.listS3Objects]: listS3Objects,
  [IntTestHelpers.putS3Object]: putS3Object,
  [IntTestHelpers.deleteS3ObjectsByPrefix]: deleteS3ObjectsByPrefix,
  [IntTestHelpers.deleteS3Objects]: deleteS3Objects,
  [IntTestHelpers.checkIfS3ObjectExists]: checkIfS3ObjectExists,
  [IntTestHelpers.checkGivenStringExistsInLogs]: checkGivenStringExistsInLogs,
  [IntTestHelpers.getRecentCloudwatchLogs]: getRecentCloudwatchLogs,
  [IntTestHelpers.startQueryExecutionCommand]: startQueryExecutionCommand,
  [IntTestHelpers.getQueryExecutionStatus]: getQueryExecutionStatus,
  [IntTestHelpers.getQueryResults]: getQueryResults,
  [IntTestHelpers.createInvoiceInS3]: createInvoiceInS3,
  [IntTestHelpers.invokeLambda]: invokeLambda,
  [IntTestHelpers.sendEmail]: sendEmailWithoutAttachments,
  [IntTestHelpers.sendRawEmail]: sendRawEmail,
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

export const handler = async <T extends IntTestHelpers>(
  event: TestSupportEvent<T>,
  _context: Context
): Promise<TestSupportReturn> => {
  process.env.ENV_NAME = event.environment;
  process.env.CONFIG_NAME = event.config;

  console.log(
    `Executing command "${event.command}" with parameters "${
      event.parameters !== null ? `${Object.keys(event.parameters)}` : null
    }" in environment "${event.environment}" with config "${event.config}"`
  );

  const retVal = await callFunction(event.command, event.parameters);

  return { success: true, successObject: retVal };
};

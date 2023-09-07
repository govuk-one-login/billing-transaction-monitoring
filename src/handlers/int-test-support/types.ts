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
  sendEmail = "sendEmail",
  sendMessageToQueue = "sendMessageToQueue",
  invokeLambda = "invokeLambda",
}

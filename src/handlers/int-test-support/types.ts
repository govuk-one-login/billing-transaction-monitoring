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

export type FullExtractData = {
  vendor_id: string;
  vendor_name: string;
  event_name: string;
  service_name: string;
  contract_id: string;
  contract_name: string;
  year: string;
  month: string;
  billing_unit_price: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: string;
  invoice_is_quarterly: string;
};

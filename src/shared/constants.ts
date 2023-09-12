import { ValidTextractJobStatus } from "./types";

export enum ConfigElements {
  rates = "rates",
  services = "services",
  contracts = "contracts",
  renamingMap = "renamingMap",
  inferences = "inferences",
  transformations = "transformations",
  vat = "vat",
  standardisation = "standardisation",
  eventCleaningTransform = "eventCleaningTransform",
  allowedUsers = "allowedUsers",
  syntheticEvents = "syntheticEvents"
}

export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE = "failed";
export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS = "successful";

export const VALID_TEXTRACT_STATUS_MESSAGES = new Set<ValidTextractJobStatus>([
  "FAILED",
  "PARTIAL_SUCCESS",
  "SUCCEEDED",
]);

export const AWS_REGION = "eu-west-2";

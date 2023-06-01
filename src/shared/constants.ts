import { ValidTextractJobStatus } from "./types";

export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE = "failed";
export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS = "successful";

export const VALID_TEXTRACT_STATUS_MESSAGES = new Set<ValidTextractJobStatus>([
  "FAILED",
  "PARTIAL_SUCCESS",
  "SUCCEEDED",
]);

export const VENDOR_INVOICE_STANDARDISATION_CONFIG_PATH =
  "vendor-invoice-standardisation.json";

export const VENDOR_SERVICE_CONFIG_PATH = "vendor_services/vendor-services.csv";

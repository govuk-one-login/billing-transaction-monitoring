import { ValidEventName, ValidTextractJobStatus } from "./types";

export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE = "failed";
export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS = "successful";

export const VALID_EVENT_NAMES = new Set<ValidEventName>([
  "IPV_PASSPORT_CRI_REQUEST_SENT",
  "IPV_PASSPORT_CRI_RESPONSE_RECEIVED",
  "IPV_FRAUD_CRI_REQUEST_SENT",
  "IPV_FRAUD_CRI_THIRD_PARTY_REQUEST_ENDED",
  "IPV_ADDRESS_CRI_REQUEST_SENT",
  "IPV_ADDRESS_CRI_END",
  "IPV_KBV_CRI_REQUEST_SENT",
  "IPV_KBV_CRI_THIRD_PARTY_REQUEST_ENDED",
]);

export const VALID_TEXTRACT_STATUS_MESSAGES = new Set<ValidTextractJobStatus>([
  "FAILED",
  "PARTIAL_SUCCESS",
  "SUCCEEDED",
]);

export const VENDOR_SERVICE_CONFIG_PATH = "vendor_services/vendor-services.csv";

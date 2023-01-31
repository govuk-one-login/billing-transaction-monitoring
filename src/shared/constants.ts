import { ValidEventName, ValidTextractJobStatus } from "./types";

export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_FAILURE = "failed";
export const RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS = "successful";

export const VALID_EVENT_NAMES = new Set<ValidEventName>([
  "EVENT_1",
  "EVENT_2",
  "EVENT_3",
  "EVENT_4",
  "EVENT_5",
  "EVENT_6",
  "EVENT_7",
  "EVENT_8",
  "IPV_C3_TEST1",
  "IPV_C3_S_TEST1",
  "IPV_C3_S_TEST2",
  "IPV_C3_SI_TEST2",
  "IPV_C3_TEST3",
  "IPV_C4_TEST1",
  "IPV_C4_S_TEST1",
  "IPV_C4_S_TEST2",
  "IPV_C4_SI_TEST2",
  "IPV_C4_TEST3",
]);

export const VALID_TEXTRACT_STATUS_MESSAGES = new Set<ValidTextractJobStatus>([
  "FAILED",
  "PARTIAL_SUCCESS",
  "SUCCEEDED",
]);

export const VENDOR_SERVICE_CONFIG_PATH = "vendor_services/vendor-services.csv";

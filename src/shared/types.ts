export type ValidEventName =
  | "IPV_ADDRESS_CRI_END"
  | "IPV_ADDRESS_CRI_REQUEST_SENT"
  | "IPV_FRAUD_CRI_REQUEST_SENT"
  | "IPV_FRAUD_CRI_THIRD_PARTY_REQUEST_ENDED"
  | "IPV_KBV_CRI_REQUEST_SENT"
  | "IPV_KBV_CRI_THIRD_PARTY_REQUEST_ENDED"
  | "IPV_PASSPORT_CRI_REQUEST_SENT"
  | "IPV_PASSPORT_CRI_RESPONSE_RECEIVED"
  | "NEW_EVENT_NAME";

export interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export type ValidTextractJobStatus = "FAILED" | "PARTIAL_SUCCESS" | "SUCCEEDED";

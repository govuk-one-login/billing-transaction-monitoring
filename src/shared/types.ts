export type ValidEventName =
  | "EVENT_6"
  | "EVENT_5"
  | "EVENT_3"
  | "EVENT_4"
  | "EVENT_7"
  | "EVENT_8"
  | "EVENT_1"
  | "EVENT_2"
  | "IPV_C3_TEST1"
  | "IPV_C3_S_TEST1"
  | "IPV_C3_S_TEST2"
  | "IPV_C3_SI_TEST2"
  | "IPV_C3_TEST3"
  | "IPV_C4_TEST1"
  | "IPV_C4_S_TEST1"
  | "IPV_C4_S_TEST2"
  | "IPV_C4_SI_TEST2"
  | "IPV_C4_TEST3";

export interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export type ValidTextractJobStatus = "FAILED" | "PARTIAL_SUCCESS" | "SUCCEEDED";

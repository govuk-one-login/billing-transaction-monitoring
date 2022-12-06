export type ValidEventName =
  | "EVENT_6"
  | "EVENT_5"
  | "EVENT_3"
  | "EVENT_4"
  | "EVENT_7"
  | "EVENT_8"
  | "EVENT_1"
  | "EVENT_2";

export interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export type ValidTextractJobStatus = "FAILED" | "PARTIAL_SUCCESS" | "SUCCEEDED";

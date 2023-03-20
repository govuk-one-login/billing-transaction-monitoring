export interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export type ValidTextractJobStatus = "FAILED" | "PARTIAL_SUCCESS" | "SUCCEEDED";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

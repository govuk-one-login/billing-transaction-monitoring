export interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export type ValidTextractJobStatus = "FAILED" | "PARTIAL_SUCCESS" | "SUCCEEDED";

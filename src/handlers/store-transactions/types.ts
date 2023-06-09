export interface CleanedEventBody {
  vendor_id: string;
  component_id: string;
  event_id: string;
  event_name: string;
  timestamp: number;
  timestamp_formatted: string;
  user?: {
    transaction_id?: string;
  };
}

export enum Env {
  STORAGE_BUCKET = "STORAGE_BUCKET",
  EVENT_DATA_FOLDER = "EVENT_DATA_FOLDER",
}

export const isValidIncomingCleanedEventBody = (
  x: unknown
): x is CleanedEventBody =>
  typeof x === "object" &&
  x !== null &&
  "component_id" in x &&
  typeof x.component_id === "string" &&
  "event_id" in x &&
  typeof x.event_id === "string" &&
  "timestamp" in x &&
  typeof x.timestamp === "number" &&
  "timestamp_formatted" in x &&
  typeof x.timestamp_formatted === "string" &&
  "event_name" in x &&
  typeof x.event_name === "string" &&
  "vendor_id" in x &&
  typeof x.vendor_id === "string";

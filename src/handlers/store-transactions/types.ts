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

import { ConfigElements } from "../../handler-context";

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
  credits?: number;
}

export type ConfigCache =
  | ConfigElements.services
  | ConfigElements.creditTransforms;

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type IncomingEventBody = Omit<CleanedEventBody, "vendor_id"> & {
  vendor_id?: string;
};

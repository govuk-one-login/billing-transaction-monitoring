import { ConfigElements } from "../../handler-context";
import { CleanedEventBody } from "../store-transactions/types";

export type ConfigCache = ConfigElements.services;

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type IncomingEventBody = Omit<CleanedEventBody, "vendor_id"> & {
  vendor_id?: string;
};

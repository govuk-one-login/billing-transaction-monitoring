import { ConfigElements } from "../../handler-context/config/types";

export interface Message {
  event_name: string;
}

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigCache = ConfigElements.services;

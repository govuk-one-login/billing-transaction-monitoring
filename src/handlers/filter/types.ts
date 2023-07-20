import { ConfigElements } from "../../shared/constants";

export interface MessageBody {
  event_name: string;
}

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigCache = ConfigElements.services;

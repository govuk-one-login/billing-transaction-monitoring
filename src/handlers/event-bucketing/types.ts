import { ConfigElements } from "../../shared/constants";

export enum Env {
  STORAGE_BUCKET = "STORAGE_BUCKET",
}

export interface MessageBody {
  start_date: string;
  end_date: string;
}

export type ConfigCache = ConfigElements.services;

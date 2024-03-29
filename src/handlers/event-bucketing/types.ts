import { ConfigElements } from "../../shared/constants";

export enum Env {
  STORAGE_BUCKET = "STORAGE_BUCKET",
  BUCKETING_DAYS_TO_PROCESS = "BUCKETING_DAYS_TO_PROCESS",
}

export interface MessageBody {
  start_date: string;
  end_date: string;
}

export type ConfigCache = ConfigElements.services;

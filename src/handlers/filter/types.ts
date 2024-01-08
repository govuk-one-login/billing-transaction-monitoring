import { ConfigElements } from "../../shared/constants";

export interface MessageBody {
  event_name: string;
  restricted?: Restricted;
}

export type Restricted = {
  drivingPermit: DrivingPermit[];
};

export type DrivingPermit = {
  issuedBy: string;
};

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigCache = ConfigElements.services;

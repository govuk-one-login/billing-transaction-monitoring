import { ConfigElements } from "../../handler-context/config/types";

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigCache =
  | ConfigElements.renamingMap
  | ConfigElements.inferences
  | ConfigElements.transformations;

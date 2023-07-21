import { ConfigElements } from "../../shared/constants";

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigCache =
  | ConfigElements.renamingMap
  | ConfigElements.inferences
  | ConfigElements.transformations;

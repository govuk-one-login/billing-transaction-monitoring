import { ConfigFileNames } from "../../handler-context/config/types";

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigFiles =
  | ConfigFileNames.renamingMap
  | ConfigFileNames.inferences
  | ConfigFileNames.transformations;

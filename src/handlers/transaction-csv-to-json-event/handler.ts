import { buildHandler } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/config/types";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env, ConfigFiles } from "./types";

export const handler = buildHandler<string, Env, ConfigFiles>({
  envVars: [Env.OUTPUT_QUEUE_URL],
  messageTypeGuard: (message: any): message is string =>
    typeof message === "string",
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  configFiles: [
    ConfigFileNames.renamingMap,
    ConfigFileNames.inferences,
    ConfigFileNames.transformations,
  ],
})(businessLogic);

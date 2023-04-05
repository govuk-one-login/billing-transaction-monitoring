import { buildHandler } from "../../handler-context";
import { ConfigElements } from "../../handler-context/config/types";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env, ConfigCache } from "./types";

export const handler = buildHandler<string, Env, ConfigCache>({
  envVars: [Env.OUTPUT_QUEUE_URL],
  messageTypeGuard: (message: any): message is string =>
    typeof message === "string",
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  ConfigCache: [
    ConfigElements.renamingMap,
    ConfigElements.inferences,
    ConfigElements.transformations,
  ],
})(businessLogic);

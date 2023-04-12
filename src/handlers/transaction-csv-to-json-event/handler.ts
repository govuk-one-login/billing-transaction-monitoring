import { buildHandler, ConfigElements } from "../../handler-context";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env, ConfigCache } from "./types";
import { Message } from "../filter/types";

export const handler = buildHandler<string, Env, ConfigCache, Message>(
  businessLogic,
  {
    envVars: [Env.OUTPUT_QUEUE_URL],
    messageTypeGuard: (message: any): message is string =>
      typeof message === "string",
    outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
    ConfigCache: [
      ConfigElements.renamingMap,
      ConfigElements.inferences,
      ConfigElements.transformations,
    ],
  }
);

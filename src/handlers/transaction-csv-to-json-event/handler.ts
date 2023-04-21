import { buildHandler, ConfigElements } from "../../handler-context";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env } from "./types";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.OUTPUT_QUEUE_URL],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is string =>
    typeof maybeIncomingMessageBody === "string",
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  ConfigCache: [
    ConfigElements.renamingMap,
    ConfigElements.inferences,
    ConfigElements.transformations,
  ],
});

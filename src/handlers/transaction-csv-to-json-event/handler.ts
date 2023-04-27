import { buildHandler, ConfigElements } from "../../handler-context";
import { stringifyAndSendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env } from "./types";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.OUTPUT_QUEUE_URL],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is string =>
    typeof maybeIncomingMessageBody === "string",
  outputs: [
    { destination: Env.OUTPUT_QUEUE_URL, store: stringifyAndSendRecord },
  ],
  ConfigCache: [
    ConfigElements.renamingMap,
    ConfigElements.inferences,
    ConfigElements.transformations,
  ],
});

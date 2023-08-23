import { buildHandler } from "../../handler-context";
import { ConfigElements } from "../../shared/constants";
import { stringifyAndSendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
// import { store } from "./store";

export const handler = buildHandler({
  businessLogic,
  envVars: [
    Env.CONFIG_BUCKET,
    Env.OUTPUT_QUEUE_URL
  ],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is never => true,
  outputs: [
    { destination: Env.OUTPUT_QUEUE_URL, store: stringifyAndSendRecord },
  ],
  withBatchItemFailures: false,
  ConfigCache: [ConfigElements.syntheticEvents],
});

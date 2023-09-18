import { buildHandler } from "../../handler-context";
import { stringifyAndSendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.OUTPUT_QUEUE_URL, Env.STORAGE_BUCKET],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is never => true,
  outputs: [
    { destination: Env.OUTPUT_QUEUE_URL, store: stringifyAndSendRecord },
  ],
  withBatchItemFailures: false,
  ConfigCache: [ConfigElements.syntheticEvents],
});

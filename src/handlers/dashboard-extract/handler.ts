import { ConfigElements, buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
import { store } from "./store";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.DESTINATION_BUCKET],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is never => true,
  outputs: [{ destination: Env.DESTINATION_BUCKET, store }],
  withBatchItemFailures: false,
  ConfigCache: [ConfigElements.services],
});

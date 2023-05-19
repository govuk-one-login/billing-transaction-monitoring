import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
import { store } from "./store";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.DESTINATION_BUCKET],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is string =>
    typeof maybeIncomingMessageBody === "string", // Talk to Mark P about this
  outputs: [{ destination: Env.DESTINATION_BUCKET, store }],
  withBatchItemFailures: true,
  ConfigCache: [],
});

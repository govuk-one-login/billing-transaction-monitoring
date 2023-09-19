import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Env } from "./types";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.STORAGE_BUCKET],
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ): maybeIncomingMessageBody is never => true,
  outputs: [],
  withBatchItemFailures: false,
  ConfigCache: [],
});

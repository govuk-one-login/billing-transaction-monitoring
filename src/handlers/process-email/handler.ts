import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
import { store } from "./store";
import { isValidIncomingMessageBody } from "./is-valid-incoming-message-body";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.DESTINATION_BUCKET],
  incomingMessageBodyTypeGuard: isValidIncomingMessageBody,
  outputs: [{ destination: Env.DESTINATION_BUCKET, store }],
  withBatchItemFailures: true,
  ConfigCache: [],
});

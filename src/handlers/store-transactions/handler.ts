import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Env, isValidIncomingCleanedEventBody } from "./types";
import { store } from "./store";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.STORAGE_BUCKET, Env.EVENT_DATA_FOLDER],
  incomingMessageBodyTypeGuard: isValidIncomingCleanedEventBody,
  outputs: [{ destination: Env.STORAGE_BUCKET, store }],
  withBatchItemFailures: true,
  ConfigCache: [],
});

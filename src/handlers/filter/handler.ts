import { buildHandler, ConfigElements } from "../../handler-context";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
import { isValidIncomingMessageBody } from "./is-valid-incoming-message-body";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.OUTPUT_QUEUE_URL],
  incomingMessageBodyTypeGuard: isValidIncomingMessageBody,
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  withBatchItemFailures: true,
  ConfigCache: [ConfigElements.services],
});

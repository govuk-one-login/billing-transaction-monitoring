import { ConfigElements, buildHandler } from "../../handler-context";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { isValidIncomingEventBody } from "./is-valid-incoming-event-body";
import { Env } from "./types";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.OUTPUT_QUEUE_URL],
  incomingMessageBodyTypeGuard: isValidIncomingEventBody,
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  withBatchItemFailures: true,
  ConfigCache: [ConfigElements.services],
});

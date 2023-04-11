import { buildHandler, ConfigElements } from "../../handler-context";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { ConfigCache, Env, Message } from "./types";

export const handler = buildHandler<Message, Env, ConfigCache>({
  envVars: [Env.OUTPUT_QUEUE_URL],
  messageTypeGuard: (maybeMessage: any): maybeMessage is Message =>
    !!maybeMessage?.event_name && typeof maybeMessage?.event_name === "string",
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  ConfigCache: [ConfigElements.services],
})(businessLogic);

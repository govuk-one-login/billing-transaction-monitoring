import { buildHandler, ConfigElements } from "../../handler-context";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { ConfigCache, Env, Message } from "./types";
import { isValidMessageType } from "./is-valid-message-type";

export const handler = buildHandler<Message, Env, ConfigCache, Message>(
  businessLogic,
  {
    envVars: [Env.OUTPUT_QUEUE_URL],
    messageTypeGuard: isValidMessageType,
    outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
    ConfigCache: [ConfigElements.services],
  }
);

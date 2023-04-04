import { buildHandler } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/config/types";
import { sendRecord } from "../../shared/utils";
import { businessLogic } from "./business-logic";
import { ConfigFiles, Env, Message } from "./types";

export const handler = buildHandler<Message, Env, ConfigFiles>({
  envVars: [Env.OUTPUT_QUEUE_URL],
  messageTypeGuard: (maybeMessage: any): maybeMessage is Message =>
    !!maybeMessage?.event_name,
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  configFiles: [ConfigFileNames.services],
})(businessLogic);

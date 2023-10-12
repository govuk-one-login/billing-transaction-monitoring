import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { isValidIncomingMessageBody } from "./is-valid-incoming-message-body";
import { Env } from "./types";

export const handler = buildHandler({
  businessLogic,
  envVars: [
    Env.STORAGE_BUCKET,
    Env.BUCKETING_DAYS_TO_PROCESS,
    Env.BUCKETING_FILE_COUNT,
  ],
  incomingMessageBodyTypeGuard: isValidIncomingMessageBody,
  outputs: [],
  withBatchItemFailures: false,
  ConfigCache: [],
});

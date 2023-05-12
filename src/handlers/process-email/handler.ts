import { buildHandler } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Env } from "./types";
import { isValidIncomingMessageBody } from "./is-valid-incoming-message-body";

export const handler = buildHandler({
  businessLogic,
  envVars: [Env.DESTINATION_BUCKET],
  incomingMessageBodyTypeGuard: isValidIncomingMessageBody,
  outputs: [], // Upload attachments to Raw Invoice S3 bucket
  withBatchItemFailures: true,
  ConfigCache: [],
});

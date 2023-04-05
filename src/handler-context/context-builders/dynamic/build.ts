import { S3Event, SQSEvent } from "aws-lambda";
import { CtxBuilderOptions } from "../../types";
import { ConfigElements } from "../../config";
import { StaticHandlerCtxElements } from "../static/build";
import { makeCtxMessages } from "./elements/messages";

export interface DynamicHandlerCtxElements<TMessage> {
  messages: TMessage[];
}

// These are the elements of the context which we cannot
// create until invocation time
export const build = async <
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
>(
  event: S3Event | SQSEvent,
  { messageTypeGuard }: CtxBuilderOptions<TMessage, TEnvVars, TConfigElements>,
  { logger }: StaticHandlerCtxElements<TEnvVars, TConfigElements>
): Promise<DynamicHandlerCtxElements<TMessage>> => {
  const messages = await makeCtxMessages(event, messageTypeGuard, logger);

  return {
    messages,
  };
};

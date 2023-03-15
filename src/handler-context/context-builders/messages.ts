import { SQSEvent } from "aws-lambda";
import { HandlerCtx } from "..";
import { ConfigFileNames } from "../Config";

// N.B. this is an adaptor from SQSEvents to domain messages
export const addMessagesToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  { Records }: SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  const messages = Records.map<
    HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["messages"][0]
  >(({ messageId: _id, body: rawBody }) => {
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      ctx.logger.error(`Received a message whose body was not valid JSON`);
      throw new Error(`Could not process message ${_id}`);
    }
    const messageIsExpectedType = messageTypeGuard(body);
    if (!messageIsExpectedType) {
      ctx.logger.error(
        `Received a message which did not conform to the expected type`
      );
      throw new Error(`Could not process message ${_id}`);
    }
    // we attach the _id to the message so that we can handle batch item failures
    return { ...body, _id };
  });
  return { ...ctx, messages };
};

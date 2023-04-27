import { ConfigElements } from "./config";
import {
  BusinessLogic,
  HandlerCtx,
  HandlerIncomingMessage,
  HandlerMessageBody,
  HandlerOutgoingMessage,
} from "./types";

type ReturnType<TOutputMessageBody extends HandlerMessageBody> = Promise<{
  outgoingMessages: Array<HandlerOutgoingMessage<TOutputMessageBody>>;
  failedIds: string[];
}>;

const ERROR_MESSAGE = "Business logic failure";

export const runBusinessLogic = async <
  TInputMessageBody extends HandlerMessageBody,
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutputMessageBody extends HandlerMessageBody
>(
  businessLogic: BusinessLogic<
    TInputMessageBody,
    TEnvVars,
    TConfigElements,
    TOutputMessageBody
  >,
  incomingMessages: Array<HandlerIncomingMessage<TInputMessageBody>>,
  ctx: HandlerCtx<TEnvVars, TConfigElements, TOutputMessageBody>,
  failuresAllowed?: boolean
): ReturnType<TOutputMessageBody> => {
  const failedIds: Array<string | undefined> = [];

  const resultArrayPromises: Array<
    Promise<Array<HandlerOutgoingMessage<TOutputMessageBody>>>
  > = incomingMessages.map(async ({ id, body }) => {
    try {
      const outgoingMessageBodies = await businessLogic(body, ctx);
      return outgoingMessageBodies.map((body) => ({ originalId: id, body }));
    } catch (error) {
      ctx.logger.error(ERROR_MESSAGE, {
        error,
        messageId: id,
      });

      failedIds.push(id);

      return [];
    }
  });

  const resultArrays = await Promise.all(resultArrayPromises);

  const aFailedIdIsUndefined = failedIds.some((id) => id === undefined);

  if (aFailedIdIsUndefined || (!failuresAllowed && failedIds.length > 0))
    throw new Error(ERROR_MESSAGE);

  return {
    failedIds: failedIds as string[],
    outgoingMessages: resultArrays.flat(),
  };
};

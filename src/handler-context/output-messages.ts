import { ConfigElements } from "./config";
import {
  HandlerCtx,
  HandlerMessageBody,
  HandlerOutgoingMessage,
} from "./types";

const ERROR_MESSAGE_DEFAULT = "Output failure";
const ERROR_MESSAGE_STORAGE = "Storage failure";

export const outputMessages = async <
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TMessageBody extends HandlerMessageBody
>(
  messages: Array<HandlerOutgoingMessage<TMessageBody>>,
  ctx: HandlerCtx<TEnvVars, TConfigElements>,
  failuresAllowed?: boolean
): Promise<{ failedIds: string[] }> => {
  const failedIds = new Set<string | undefined>();

  const promises = messages.map(async ({ originalId, body }) => {
    try {
      await outputMessage(body, ctx);
    } catch (error) {
      ctx.logger.error(ERROR_MESSAGE_DEFAULT, {
        error,
        incomingMessageId: originalId,
      });

      failedIds.add(originalId);
    }
  });

  await Promise.allSettled(promises);

  const aFailedIdIsUndefined = failedIds.has(undefined);

  if (aFailedIdIsUndefined || (!failuresAllowed && failedIds.size > 0))
    throw new Error(ERROR_MESSAGE_DEFAULT);

  return { failedIds: Array.from(failedIds) as string[] };
};

const outputMessage = async <
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TMessageBody extends HandlerMessageBody
>(
  body: TMessageBody,
  { logger, outputs }: HandlerCtx<TEnvVars, TConfigElements>
): Promise<void> => {
  const outputBody = typeof body === "string" ? body : JSON.stringify(body);

  const promises = outputs.map(async ({ destination, store }) => {
    try {
      await store(destination, outputBody);
    } catch (error) {
      logger.error(ERROR_MESSAGE_STORAGE, { destination, error });
      throw error;
    }
  });

  const results = await Promise.allSettled(promises);

  const resultWasRejected = results.some(
    (result) => result.status === "rejected"
  );

  if (resultWasRejected) throw new Error(ERROR_MESSAGE_STORAGE);
};

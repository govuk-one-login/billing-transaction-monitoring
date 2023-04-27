import { ConfigElements } from "./config";
import {
  HandlerCtx,
  HandlerMessageBody,
  HandlerOutgoingMessage,
} from "./types";

const BATCH_SIZE = 1000;
const ERROR_MESSAGE_DEFAULT = "Output failure";
const ERROR_MESSAGE_STORAGE = "Storage failure";

export const outputMessages = async <
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TMessageBody extends HandlerMessageBody
>(
  messages: Array<HandlerOutgoingMessage<TMessageBody>>,
  ctx: HandlerCtx<TEnvVars, TConfigElements, TMessageBody>,
  failuresAllowed?: boolean
): Promise<{ failedIds: string[] }> => {
  const failedIds = new Set<string | undefined>();

  for (let index = 0; index < messages.length; index += BATCH_SIZE) {
    const promises = messages
      .slice(index, index + BATCH_SIZE)
      .map(async ({ originalId, body }) => {
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
  }

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
  { logger, outputs }: HandlerCtx<TEnvVars, TConfigElements, TMessageBody>
): Promise<void> => {
  const outputBody = typeof body === "string" ? body : JSON.stringify(body);

  const promises = outputs.map(async (output) => {
    try {
      const args = output?.argsGenerator?.(body) ?? [];

      await output.store.apply(null, [output.destination, outputBody, ...args]);
    } catch (error) {
      logger.error(ERROR_MESSAGE_STORAGE, {
        destination: output.destination,
        error,
      });
      throw error;
    }
  });

  const results = await Promise.allSettled(promises);

  const resultWasRejected = results.some(
    (result) => result.status === "rejected"
  );

  if (resultWasRejected) throw new Error(ERROR_MESSAGE_STORAGE);
};

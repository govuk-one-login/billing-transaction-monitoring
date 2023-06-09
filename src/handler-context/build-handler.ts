import { S3Event, SQSEvent } from "aws-lambda";
import { ConfigElements } from "./config";
import { buildContext } from "./context-builder";
import { makeIncomingMessages } from "./make-incoming-messages";
import { HandlerOptions, HandlerMessageBody } from "./types";
import { outputMessages } from "./output-messages";
import { runBusinessLogic } from "./run-business-logic";
import { logger } from "../shared/utils";

export const buildHandler =
  <
    TIncomingMessageBody extends HandlerMessageBody,
    TEnvVars extends string,
    TConfigElements extends ConfigElements,
    TOutgoingMessageBody extends HandlerMessageBody
  >(
    options: HandlerOptions<
      TIncomingMessageBody,
      TEnvVars,
      TConfigElements,
      TOutgoingMessageBody
    >
  ) =>
  async (event: S3Event | SQSEvent) => {
    try {
      const ctx = await buildContext(logger, options);

      const { incomingMessages, failedIds: failedIncomingIds } =
        await makeIncomingMessages(
          event,
          options.incomingMessageBodyTypeGuard,
          ctx.logger,
          options.withBatchItemFailures
        );

      const { outgoingMessages, failedIds: failedBusinessLogicIds } =
        await runBusinessLogic(
          options.businessLogic,
          incomingMessages,
          ctx,
          options.withBatchItemFailures
        );

      const { failedIds: failedOutputIds } = await outputMessages(
        outgoingMessages,
        ctx,
        options.withBatchItemFailures
      );

      if (options.withBatchItemFailures)
        return {
          batchItemFailures: [
            ...failedIncomingIds,
            ...failedBusinessLogicIds,
            ...failedOutputIds,
          ],
        };
    } catch (error) {
      logger.error("Handler failure", { error });
      throw error;
    }
  };

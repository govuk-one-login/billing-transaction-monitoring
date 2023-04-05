import { S3Event, SQSEvent } from "aws-lambda";
import { ConfigElements } from "./config";
import {
  buildDynamicContextElements,
  buildStaticContextElements,
} from "./context-builders";
import { outputMessages } from "./output-messages";
import { BusinessLogic, CtxBuilderOptions } from "./types";

export const buildHandler =
  <TMessage, TEnvVars extends string, TConfigElements extends ConfigElements>(
    options: CtxBuilderOptions<TMessage, TEnvVars, TConfigElements>
  ) =>
  (businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigElements>) => {
    const staticContextElementsPromise = buildStaticContextElements(options);
    return async (event: S3Event | SQSEvent) => {
      const dynamicContextElements = await buildDynamicContextElements(
        event,
        options,
        await staticContextElementsPromise
      );
      const ctx = {
        ...dynamicContextElements,
        ...(await staticContextElementsPromise),
      };
      const results = await businessLogic(ctx);
      return await outputMessages(results, ctx);
    };
  };

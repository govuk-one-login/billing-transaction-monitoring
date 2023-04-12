import { S3Event, SQSEvent } from "aws-lambda";
import { ConfigElements } from "./config";
import {
  buildDynamicContextElements,
  buildStaticContextElements,
} from "./context-builders";
import { outputMessages } from "./output-messages";
import { BusinessLogic, CtxBuilderOptions } from "./types";

export const buildHandler =
  <
    TMessage,
    TEnvVars extends string,
    TConfigElements extends ConfigElements,
    TResult extends string | {}
  >(
    businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigElements, TResult>,
    options: CtxBuilderOptions<TMessage, TEnvVars, TConfigElements>
  ) =>
  async (event: S3Event | SQSEvent) => {
    const staticContextElementsPromise = buildStaticContextElements(options);
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

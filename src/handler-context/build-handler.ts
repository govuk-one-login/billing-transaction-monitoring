import { S3Event, SQSEvent } from "aws-lambda";
import { ConfigElements } from "./config";
import {
  buildDynamicContextElements,
  buildStaticContextElements,
} from "./context-builders";
import { outputMessages } from "./output-messages";
import { BusinessLogic, CtxBuilderOptions } from "./types";
import { Response } from "../shared/types";

export const buildHandler = async <
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
>(
  businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigElements>,
  options: CtxBuilderOptions<TMessage, TEnvVars, TConfigElements>
): Promise<(event: S3Event | SQSEvent) => Promise<Response>> => {
  const staticContextElements = await buildStaticContextElements(options);
  return async (event: S3Event | SQSEvent) => {
    const dynamicContextElements = await buildDynamicContextElements(
      event,
      options,
      staticContextElements
    );
    const ctx = { ...dynamicContextElements, ...staticContextElements };
    const results = await businessLogic(ctx);
    return await outputMessages(results, ctx);
  };
};

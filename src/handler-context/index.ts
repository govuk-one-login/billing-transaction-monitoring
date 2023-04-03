import { S3Event, SQSEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { Response } from "../shared/types";
import { ConfigFileNames, PickedFiles } from "./config/types";
import { outputMessages } from "./context-builders/outputs";
import {
  buildDynamicContextElements,
  buildStaticContextElements,
} from "./context-builders";

export type OutputFunction = (
  destination: string,
  message: string
) => Promise<void>;

export type Outputs = Array<{
  destination: string;
  store: OutputFunction;
}>;

export type UserDefinedOutputFunction<TEnvVars extends string> = (
  destination: TEnvVars,
  message: string
) => Promise<void>;

export type UserDefinedOutputs<TEnvVars extends string> = Array<{
  destination: TEnvVars;
  store: UserDefinedOutputFunction<TEnvVars>;
}>;

export type BusinessLogic<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> = (
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
) => Promise<unknown[]>;

export interface StaticHandlerCtxElements<
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> {
  env: Record<TEnvVars, string>;
  logger: Logger;
  outputs: Outputs;
  config: PickedFiles<TConfigFileNames>;
}

export interface DynamicHandlerCtxElements<TMessage> {
  messages: TMessage[];
}

export type HandlerCtx<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> = StaticHandlerCtxElements<TEnvVars, TConfigFileNames> &
  DynamicHandlerCtxElements<TMessage>;

export type Handler<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> = (
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
) => Promise<Response>;

export interface CtxBuilderOptions<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> {
  envVars: TEnvVars[];
  messageTypeGuard: (maybeMessage: unknown) => maybeMessage is TMessage;
  outputs: UserDefinedOutputs<TEnvVars>;
  configFiles: TConfigFileNames[];
}

export const buildHandler =
  <TMessage, TEnvVars extends string, TConfigFileNames extends ConfigFileNames>(
    options: CtxBuilderOptions<TMessage, TEnvVars, TConfigFileNames>
  ) =>
  async (
    businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigFileNames>
  ) => {
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

import { S3Event, SQSEvent } from "aws-lambda";
import { Response } from "../shared/types";
import { ConfigFileNames } from "./config/types";
import {
  buildDynamicContextElements,
  buildStaticContextElements,
} from "./context-builders";
import { outputMessages } from "./output-messages";
import { StaticHandlerCtxElements } from "./context-builders/static/build";
import { DynamicHandlerCtxElements } from "./context-builders/dynamic/build";

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
  (businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigFileNames>) => {
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

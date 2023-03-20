import { S3Event, SQSEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { Response } from "../shared/types";
import { Config, ConfigFileNames } from "./Config";
import { outputMessages } from "./context-builders/outputs";
import { buildContext } from "./context-builders";

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

export interface HandlerCtx<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> {
  env: Record<TEnvVars, string>;
  messages: TMessage[];
  logger: Logger;
  outputs: Outputs;
  config: Config<TConfigFileNames>["_cache"];
  outputMessages: (
    results: unknown[],
    { outputs }: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
  ) => Promise<Response>;
}

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
  (businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigFileNames>) =>
  async (event: S3Event | SQSEvent) => {
    const ctx = await buildContext(event, options);
    const results = await businessLogic(ctx);
    return await outputMessages(results, ctx);
  };

// Make an extension of addMessagesToCtx that handles S3 events
// to work with the transaction csv to json events lambda

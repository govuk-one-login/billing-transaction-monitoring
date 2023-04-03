import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import {
  CtxBuilderOptions,
  DynamicHandlerCtxElements,
  StaticHandlerCtxElements,
} from "..";
import { ConfigFileNames } from "../config/types";
import { makeCtxConfig } from "./config";
import { makeCtxEnv } from "./env";
import { makeCtxMessages } from "./messages";
import { makeCtxOutputs } from "./outputs";

export const buildDynamicContextElements = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  event: S3Event | SQSEvent,
  { messageTypeGuard }: CtxBuilderOptions<TMessage, TEnvVars, TConfigFileNames>,
  { logger }: StaticHandlerCtxElements<TEnvVars, TConfigFileNames>
): Promise<DynamicHandlerCtxElements<TMessage>> => {
  const messages = await makeCtxMessages(event, messageTypeGuard, logger);

  return {
    messages,
  };
};

export const buildStaticContextElements = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>({
  envVars,
  outputs: userDefinedOutputs,
  configFiles,
}: CtxBuilderOptions<TMessage, TEnvVars, TConfigFileNames>): Promise<
  StaticHandlerCtxElements<TEnvVars, TConfigFileNames>
> => {
  const config = await makeCtxConfig(configFiles);
  const logger = new Logger();
  const env = makeCtxEnv(envVars, logger);
  const outputs = makeCtxOutputs(userDefinedOutputs, env);

  return {
    config,
    outputs,
    logger,
    env,
  };
};

import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import { CtxBuilderOptions, HandlerCtx } from "..";
import { ConfigFileNames } from "../config/types";
import { makeCtxConfig } from "./config";
import { makeCtxEnv } from "./env";
import { makeCtxMessages } from "./messages";
import { makeCtxOutputs } from "./outputs";

export const buildContext = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  event: S3Event | SQSEvent,
  {
    envVars,
    messageTypeGuard,
    outputs: userDefinedOutputs,
    configFiles,
  }: CtxBuilderOptions<TMessage, TEnvVars, TConfigFileNames>
): Promise<HandlerCtx<TMessage, TEnvVars, TConfigFileNames>> => {
  // raise the order of buildContext and call these 4 up front
  const config = await makeCtxConfig(configFiles);
  const logger = new Logger();
  const env = makeCtxEnv(envVars, logger);
  const outputs = makeCtxOutputs(userDefinedOutputs, env);

  const messages = await makeCtxMessages(event, messageTypeGuard, logger);

  return {
    config,
    outputs,
    messages,
    logger,
    env,
  };
};

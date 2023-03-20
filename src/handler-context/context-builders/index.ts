import { S3Event, SQSEvent } from "aws-lambda";
import { CtxBuilderOptions, HandlerCtx } from "..";
import { ConfigFileNames } from "../Config";
import { getBlankCtx } from "./blank";
import { addConfigToCtx } from "./config";
import { addEnvToCtx } from "./env";
import { addLoggerToCtx } from "./logger";
import { addMessagesToCtx } from "./messages";
import { addOutputsToCtx } from "./outputs";

export const buildContext = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  event: S3Event | SQSEvent,
  {
    envVars,
    messageTypeGuard,
    outputs,
    configFiles,
  }: CtxBuilderOptions<TMessage, TEnvVars, TConfigFileNames>
): Promise<HandlerCtx<TMessage, TEnvVars, TConfigFileNames>> => {
  // for the love of god find a nicer way to do this chain
  return addConfigToCtx(
    configFiles,
    addOutputsToCtx(
      outputs,
      await addMessagesToCtx(
        event,
        messageTypeGuard,
        addEnvToCtx(envVars, addLoggerToCtx(getBlankCtx()))
      )
    )
  );
};

import { CtxBuilderOptions, HandlerCtx } from "..";
import { ConfigFileNames } from "../Config";
import { getBlankCtx } from "./blank";
import { addConfigToCtx } from "./config";
import { addEnvToCtx } from "./env";
import { addLoggerToCtx } from "./logger";
import { addMessagesToCtx } from "./messages";
import { addOutputsToCtx } from "./outputs";

export const buildContext = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  event: unknown,
  {
    envVars,
    messageTypeGuard,
    outputs,
    configFiles,
  }: CtxBuilderOptions<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> =>
  // for the love of god find a nicer way to do this chain
  addConfigToCtx(
    configFiles,
    addOutputsToCtx(
      outputs,
      addMessagesToCtx(
        event,
        messageTypeGuard,
        addEnvToCtx(envVars, addLoggerToCtx(getBlankCtx()))
      )
    )
  );

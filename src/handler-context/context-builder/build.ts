import { Logger } from "@aws-lambda-powertools/logger";
import { HandlerOptions, HandlerCtx, HandlerMessageBody } from "../types";
import { ConfigElements } from "../config";
import { makeCtxConfig } from "./elements/config";
import { makeCtxEnv } from "./elements/env";
import { makeCtxOutputs } from "./elements/outputs";

export const buildContext = async <
  TIncomingMessageBody extends HandlerMessageBody,
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
>(
  logger: Logger,
  {
    envVars,
    outputs: userDefinedOutputs,
    ConfigCache,
  }: HandlerOptions<
    TIncomingMessageBody,
    TEnvVars,
    TConfigElements,
    TOutgoingMessageBody
  >
): Promise<HandlerCtx<TEnvVars, TConfigElements, TOutgoingMessageBody>> => {
  const config = await makeCtxConfig(ConfigCache);
  const env = makeCtxEnv(envVars, logger);
  const outputs = makeCtxOutputs(userDefinedOutputs, env);

  return {
    config,
    outputs,
    logger,
    env,
  };
};

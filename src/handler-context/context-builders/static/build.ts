import { Logger } from "@aws-lambda-powertools/logger";
import { CtxBuilderOptions, Outputs } from "../..";
import { ConfigElements, PickedConfigCache } from "../../config/types";
import { makeCtxConfig } from "./elements/config";
import { makeCtxEnv } from "./elements/env";
import { makeCtxOutputs } from "./elements/outputs";

export interface StaticHandlerCtxElements<
  TEnvVars extends string,
  TConfigElements extends ConfigElements
> {
  env: Record<TEnvVars, string>;
  logger: Logger;
  outputs: Outputs;
  config: PickedConfigCache<TConfigElements>;
}

export const build = async <
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
>({
  envVars,
  outputs: userDefinedOutputs,
  ConfigCache,
}: CtxBuilderOptions<TMessage, TEnvVars, TConfigElements>): Promise<
  StaticHandlerCtxElements<TEnvVars, TConfigElements>
> => {
  const config = await makeCtxConfig(ConfigCache);
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

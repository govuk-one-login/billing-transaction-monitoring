import { Logger } from "@aws-lambda-powertools/logger";
import { CtxBuilderOptions, Outputs } from "../..";
import { ConfigFileNames, PickedConfigFiles } from "../../config/types";
import { makeCtxConfig } from "./elements/config";
import { makeCtxEnv } from "./elements/env";
import { makeCtxOutputs } from "./elements/outputs";

export interface StaticHandlerCtxElements<
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> {
  env: Record<TEnvVars, string>;
  logger: Logger;
  outputs: Outputs;
  config: PickedConfigFiles<TConfigFileNames>;
}

export const build = async <
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

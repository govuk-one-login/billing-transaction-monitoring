import { HandlerCtx } from "..";
import { s3ConfigFileClient } from "../config/s3-config-client";
import { Config } from "../config";
import { ConfigFileNames } from "../config/types";

export const addConfigToCtx = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  files: TConfigFileNames[],
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<HandlerCtx<TMessage, TEnvVars, TConfigFileNames>> => {
  const config = new Config(s3ConfigFileClient, files, ctx.logger);
  await config.populateCache();
  return { ...ctx, config: config.getCache() };
};

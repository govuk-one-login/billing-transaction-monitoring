import { HandlerCtx } from "..";
import { ConfigFileNames, Config } from "../Config";
import { S3ConfigFileClient } from "../S3ConfigClient";

export const addConfigToCtx = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  files: TConfigFileNames[],
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<HandlerCtx<TMessage, TEnvVars, TConfigFileNames>> => {
  const config = new Config(new S3ConfigFileClient(), files, ctx.logger);
  await config.populateCache();
  return { ...ctx, config: config.getCache() };
};

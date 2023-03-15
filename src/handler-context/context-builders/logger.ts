import { Logger } from "@aws-lambda-powertools/logger";
import { HandlerCtx } from "..";
import { ConfigFileNames } from "../Config";

export const addLoggerToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  return { ...ctx, logger: new Logger() };
};

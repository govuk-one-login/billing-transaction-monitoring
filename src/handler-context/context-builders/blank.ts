import { HandlerCtx } from "..";
import { ConfigFileNames } from "../Config";

export const getBlankCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> =>
  ({} as unknown as HandlerCtx<TMessage, TEnvVars, TConfigFileNames>);

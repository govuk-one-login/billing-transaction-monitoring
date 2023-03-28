import { HandlerCtx } from "..";
import { ConfigFileNames } from "../config/types";

export const getBlankCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> =>
  ({} as unknown as HandlerCtx<TMessage, TEnvVars, TConfigFileNames>);

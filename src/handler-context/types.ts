import { Response } from "../shared/types";
import { ConfigElements } from "./config";
import { StaticHandlerCtxElements } from "./context-builders/static/build";
import { DynamicHandlerCtxElements } from "./context-builders/dynamic/build";

export type UserDefinedOutputFunction<TEnvVars extends string> = (
  destination: TEnvVars,
  message: string
) => Promise<void>;

export type UserDefinedOutputs<TEnvVars extends string> = Array<{
  destination: TEnvVars;
  store: UserDefinedOutputFunction<TEnvVars>;
}>;

export type BusinessLogic<
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
> = (
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigElements>
) => Promise<unknown[]>;

export type HandlerCtx<
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
> = StaticHandlerCtxElements<TEnvVars, TConfigElements> &
  DynamicHandlerCtxElements<TMessage>;

export type Handler<
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
> = (ctx: HandlerCtx<TMessage, TEnvVars, TConfigElements>) => Promise<Response>;

export interface CtxBuilderOptions<
  TMessage,
  TEnvVars extends string,
  TConfigElements extends ConfigElements
> {
  envVars: TEnvVars[];
  messageTypeGuard: (maybeMessage: unknown) => maybeMessage is TMessage;
  outputs: UserDefinedOutputs<TEnvVars>;
  ConfigCache: TConfigElements[];
}

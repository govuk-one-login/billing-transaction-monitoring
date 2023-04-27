import { Logger } from "@aws-lambda-powertools/logger";
import { ConfigElements, PickedConfigCache } from "./config";
import { HandlerOutputs } from "./context-builder";

export type HandlerMessageBody = string | {};

export interface HandlerIncomingMessage<TBody extends HandlerMessageBody> {
  id?: string;
  body: TBody;
}

export interface HandlerOutgoingMessage<TBody extends HandlerMessageBody> {
  originalId?: string; // ID of incoming message from which this outgoing message was derived (one incoming can have multiple outgoing)
  body: TBody;
}

export type UserDefinedOutputFunction = (
  destination: string,
  message: string,
  ...args: any[]
) => Promise<void>;

export type UserDefinedOutputs<
  TEnvVars extends string,
  TOutgoingMessageBody extends HandlerMessageBody
> = Array<{
  destination: TEnvVars;
  store: UserDefinedOutputFunction;
  argsGenerator?: (
    message: TOutgoingMessageBody
  ) => Parameters<UserDefinedOutputFunction>[2];
}>;

export type BusinessLogic<
  TIncomingMessageBody extends HandlerMessageBody,
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
> = (
  incomingMessageBody: TIncomingMessageBody,
  ctx: HandlerCtx<TEnvVars, TConfigElements, TOutgoingMessageBody>
) => Promise<TOutgoingMessageBody[]> | TOutgoingMessageBody[];

export interface HandlerCtx<
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
> {
  env: Record<TEnvVars, string>;
  logger: Logger;
  outputs: HandlerOutputs<TOutgoingMessageBody>;
  config: PickedConfigCache<TConfigElements>;
}

export interface HandlerOptions<
  TIncomingMessageBody extends HandlerMessageBody,
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
> {
  businessLogic: BusinessLogic<
    TIncomingMessageBody,
    TEnvVars,
    TConfigElements,
    TOutgoingMessageBody
  >;
  envVars: TEnvVars[];
  incomingMessageBodyTypeGuard: (
    maybeIncomingMessageBody: unknown
  ) => maybeIncomingMessageBody is TIncomingMessageBody;
  outputs: UserDefinedOutputs<TEnvVars, TOutgoingMessageBody>;
  withBatchItemFailures?: boolean;
  ConfigCache: TConfigElements[];
}

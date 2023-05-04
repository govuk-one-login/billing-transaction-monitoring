import { ConfigElements } from "../../config";
import {
  HandlerCtx,
  HandlerMessageBody,
  UserDefinedOutputs,
} from "../../types";

type OutputFunction<
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
> = (
  destination: string,
  message: TOutgoingMessageBody,
  ctx: HandlerCtx<TEnvVars, TConfigElements, TOutgoingMessageBody>
) => Promise<void>;

export type HandlerOutputs<
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
> = Array<{
  destination: string;
  store: OutputFunction<TEnvVars, TConfigElements, TOutgoingMessageBody>;
}>;

export const makeCtxOutputs = <
  TEnvVars extends string,
  TConfigElements extends ConfigElements,
  TOutgoingMessageBody extends HandlerMessageBody
>(
  outputs: UserDefinedOutputs<TEnvVars, TConfigElements, TOutgoingMessageBody>,
  env: Record<TEnvVars, string>
): HandlerOutputs<TEnvVars, TConfigElements, TOutgoingMessageBody> => {
  return outputs.map(({ destination, store }) => ({
    destination: env[destination],
    store,
  }));
};

import { HandlerMessageBody, UserDefinedOutputs } from "../../types";

type OutputFunction<TOutgoingMessageBody extends HandlerMessageBody> = (
  destination: string,
  message: TOutgoingMessageBody
) => Promise<void>;

export type HandlerOutputs<TOutgoingMessageBody extends HandlerMessageBody> =
  Array<{
    destination: string;
    store: OutputFunction<TOutgoingMessageBody>;
  }>;

export const makeCtxOutputs = <
  TEnvVars extends string,
  TOutgoingMessageBody extends HandlerMessageBody
>(
  outputs: UserDefinedOutputs<TEnvVars, TOutgoingMessageBody>,
  env: Record<TEnvVars, string>
): HandlerOutputs<TOutgoingMessageBody> => {
  return outputs.map(({ destination, store }) => ({
    destination: env[destination],
    store,
  }));
};

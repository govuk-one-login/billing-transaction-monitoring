import { HandlerMessageBody, UserDefinedOutputs } from "../../types";

type OutputFunction = (
  destination: string,
  message: string,
  ...args: any[]
) => Promise<void>;

export type HandlerOutputs<TOutgoingMessageBody extends HandlerMessageBody> =
  Array<{
    destination: string;
    store: OutputFunction;
    argsGenerator?: (
      message: TOutgoingMessageBody
    ) => Parameters<OutputFunction>[2];
  }>;

export const makeCtxOutputs = <
  TEnvVars extends string,
  TOutgoingMessageBody extends HandlerMessageBody
>(
  outputs: UserDefinedOutputs<TEnvVars, TOutgoingMessageBody>,
  env: Record<TEnvVars, string>
): HandlerOutputs<TOutgoingMessageBody> => {
  return outputs.map(({ destination, ...rest }) => ({
    destination: env[destination],
    ...rest,
  }));
};

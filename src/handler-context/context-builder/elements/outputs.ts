import { UserDefinedOutputs } from "../../types";

type OutputFunction = (destination: string, message: string) => Promise<void>;

export type HandlerOutputs = Array<{
  destination: string;
  store: OutputFunction;
}>;

export const makeCtxOutputs = <TEnvVars extends string>(
  outputs: UserDefinedOutputs<TEnvVars>,
  env: Record<TEnvVars, string>
): HandlerOutputs => {
  return outputs.map(({ destination, store }) => ({
    destination: env[destination],
    store: store as OutputFunction,
  }));
};

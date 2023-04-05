import { UserDefinedOutputs } from "../../../types";

type OutputFunction = (destination: string, message: string) => Promise<void>;

export type Outputs = Array<{
  destination: string;
  store: OutputFunction;
}>;

export const makeCtxOutputs = <TEnvVars extends string>(
  outputs: UserDefinedOutputs<TEnvVars>,
  env: Record<TEnvVars, string>
): Outputs => {
  return outputs.map(({ destination, store }) => ({
    destination: env[destination],
    store: store as OutputFunction,
  }));
};

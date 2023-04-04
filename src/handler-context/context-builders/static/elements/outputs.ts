import { UserDefinedOutputs, Outputs, OutputFunction } from "../../..";

export const makeCtxOutputs = <TEnvVars extends string>(
  outputs: UserDefinedOutputs<TEnvVars>,
  env: Record<TEnvVars, string>
): Outputs => {
  return outputs.map(({ destination, store }) => ({
    destination: env[destination],
    store: store as OutputFunction,
  }));
};

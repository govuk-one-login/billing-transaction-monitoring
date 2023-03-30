import { UserDefinedOutputs, HandlerCtx, OutputFunction, Outputs } from "..";
import { Response } from "../../shared/types";
import { ConfigFileNames } from "../config/types";

export const makeCtxOutputs = <TEnvVars extends string>(
  outputs: UserDefinedOutputs<TEnvVars>,
  env: Record<TEnvVars, string>
): Outputs => {
  return outputs.map(({ destination, store }) => ({
    destination: env[destination],
    store: store as OutputFunction,
  }));
};

// I don't think this belongs here
export const outputMessages = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  results: unknown[],
  { outputs }: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<Response> => {
  const promises = (results as Array<{ _id: string } | string>)
    .map((result) => {
      const outputBody = (() => {
        if (typeof result === "string") return result;
        const { _id, ...body } = result;
        return JSON.stringify(body);
      })();

      return outputs.map<Promise<string | undefined>>(
        async ({ destination, store }) =>
          await new Promise((resolve, reject) => {
            store(destination, outputBody).then(
              () => resolve((result as { _id: string })?._id),
              () => reject((result as { _id: string })?._id)
            );
          })
      );
    })
    .flat();

  return await Promise.allSettled(promises).then((resolutions) => {
    return resolutions.reduce<Response>(
      (response, outputPromise) => {
        if (outputPromise.status === "fulfilled") return response;
        return {
          ...response,
          batchItemFailures: [
            ...response.batchItemFailures,
            outputPromise.reason,
          ],
        };
      },
      { batchItemFailures: [] }
    );
  });
};

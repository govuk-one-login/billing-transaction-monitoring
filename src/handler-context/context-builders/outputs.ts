import { UserDefinedOutputs, HandlerCtx, OutputFunction } from "..";
import { Response } from "../../shared/types";
import { ConfigFileNames } from "../Config";

export const addOutputsToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  outputs: UserDefinedOutputs<TEnvVars>,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  return {
    ...ctx,
    outputs: outputs.map(({ destination, store }) => ({
      destination: ctx.env[destination],
      store: store as OutputFunction,
    })),
    outputMessages,
  };
};

export const outputMessages = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  results: unknown[],
  { outputs }: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<Response> => {
  const promises = (results as Array<{ _id: string }>)
    .map(({ _id, ...body }) =>
      outputs.map<Promise<string>>(
        async ({ destination, store }) =>
          await new Promise((resolve, reject) => {
            store(destination, JSON.stringify(body)).then(
              () => resolve(_id),
              () => reject(_id)
            );
          })
      )
    )
    .flat();

  return await Promise.allSettled(promises).then((resolutions) =>
    resolutions.reduce<Response>(
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
    )
  );
};

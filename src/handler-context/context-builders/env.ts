import { HandlerCtx } from "..";
import { ConfigFileNames } from "../Config/types";

export const addEnvToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  envVarsKeys: TEnvVars[],
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  const { isEnvValid, missingVars, env } = envVarsKeys.reduce<{
    isEnvValid: boolean;
    missingVars: string[];
    env: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["env"];
  }>(
    (acc, envVarKey) => {
      const envVar = process.env[envVarKey];
      if (envVar === undefined || !envVarKey?.length) {
        acc.isEnvValid = false;
        acc.missingVars = [...acc.missingVars, envVarKey];
      } else {
        acc.env = {
          ...acc.env,
          [envVarKey]: envVar,
        };
      }
      return acc;
    },
    {
      isEnvValid: true,
      missingVars: [],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      env: {} as HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["env"],
    }
  );
  if (!isEnvValid) {
    ctx.logger.error(`Environment is not valid, missing ${missingVars.join()}`);
    throw new Error(`Environment is not valid`);
  }

  return { ...ctx, env };
};

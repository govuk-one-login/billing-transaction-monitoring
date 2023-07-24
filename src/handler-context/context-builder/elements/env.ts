import { Logger } from "@aws-lambda-powertools/logger";
import { getFromEnv } from "../../../shared/utils";

export const makeCtxEnv = <TEnvVars extends string>(
  envVarsKeys: TEnvVars[],
  logger: Logger
): Record<TEnvVars, string> => {
  const { isEnvValid, missingVars, env } = envVarsKeys.reduce<{
    isEnvValid: boolean;
    missingVars: string[];
    env: Record<TEnvVars, string>;
  }>(
    (acc, envVarKey) => {
      const envVar = getFromEnv(envVarKey);
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
      env: {} as Record<TEnvVars, string>,
    }
  );
  if (!isEnvValid) {
    logger.error(`Environment is not valid, missing ${missingVars.join()}`);
    throw new Error(`Environment is not valid`);
  }

  return env;
};

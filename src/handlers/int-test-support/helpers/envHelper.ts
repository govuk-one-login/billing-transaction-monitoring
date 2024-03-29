import { GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { stsClient } from "../clients";

export const envName = (): string => process.env.ENV_NAME ?? "dev";

export const resourcePrefix = (): string => `di-btm-${envName()}`;

export const configName = (): string => process.env.CONFIG_NAME ?? "dev";

export const configStackName = (): string => `di-btm-cfg-${configName()}`;

export const runViaLambda = (): boolean =>
  process.env.TEST_VIA_LAMBDA === "true";

let cachedAccountId: string | undefined;

export const accountId = async (): Promise<string> =>
  cachedAccountId ?? (await fetchAndCacheAccountId());

const fetchAndCacheAccountId = async (): Promise<string> => {
  const response = await stsClient.send(new GetCallerIdentityCommand({}));
  cachedAccountId = `${response.Account}`;
  return cachedAccountId;
};

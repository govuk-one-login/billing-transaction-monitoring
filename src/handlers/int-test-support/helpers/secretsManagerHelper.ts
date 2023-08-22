import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { AWS_REGION } from "../../../shared/constants";

type GetSecretOptions = { id: string };

const secretsManager = new SecretsManager({ region: AWS_REGION });

const cache: Partial<Record<string, string>> = {};

export const getSecret = async ({ id }: GetSecretOptions): Promise<string> => {
  const cachedValue = cache[id];
  if (cachedValue !== undefined) return cachedValue;

  const { SecretString: value } = await secretsManager.getSecretValue({
    SecretId: id,
  });

  if (value === undefined) throw Error("Invalid secret");

  return value;
};

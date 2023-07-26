import AWS from "aws-sdk";
import { AWS_REGION } from "../../../shared/constants";

type GetSecretOptions = { id: string };

const secretsManager = new AWS.SecretsManager({ region: AWS_REGION });

const cache: Partial<Record<string, string>> = {};

export const getSecret = async ({ id }: GetSecretOptions): Promise<string> => {
  const cachedValue = cache[id];
  if (cachedValue !== undefined) return cachedValue;

  const { SecretString: value } = await secretsManager
    .getSecretValue({ SecretId: id })
    .promise();

  if (value === undefined) throw Error("Invalid secret");

  return value;
};

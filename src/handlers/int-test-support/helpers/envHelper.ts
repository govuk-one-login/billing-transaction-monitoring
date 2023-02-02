export const envName = (): string => process.env.ENV_NAME ?? "dev";

export const resourcePrefix = (): string => `di-btm-${envName()}`;

export const configName = (): string => process.env.CONFIG_NAME ?? "dev";

export const configStackName = (): string => `di-btm-cfg-${configName()}`;

export const runViaLambda = (): boolean =>
  process.env.TEST_VIA_LAMBDA === "true";

export const outputQueue = (): string => {
  if (
    process.env.OUTPUT_QUEUE_URL === undefined ||
    process.env.OUTPUT_QUEUE_URL.length === 0
  )
    throw new Error("no OUTPUT_QUEUE_URL defined in this environment");
  return process.env.OUTPUT_QUEUE_URL;
};

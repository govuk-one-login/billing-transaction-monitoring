import { configStackName } from "../helpers/envHelper";
import { getS3Object } from "../helpers/s3Helper";

const configBucket = configStackName();

let e2eTestConfigRowsPromise: Promise<E2ETestConfig> | undefined;

export const getE2ETestConfig = async (): Promise<E2ETestConfig> => {
  if (e2eTestConfigRowsPromise === undefined) {
    const response = await getS3Object({
      bucket: configBucket,
      key: "e2e-test.json",
    });
    const e2eTestConfig = JSON.parse(response ?? "");
    e2eTestConfigRowsPromise = Promise.resolve(e2eTestConfig);
  }
  const e2eTestConfig = await e2eTestConfigRowsPromise;
  return e2eTestConfig;
};

export interface E2ETestConfig {
  parser_0_service_description: string;
}

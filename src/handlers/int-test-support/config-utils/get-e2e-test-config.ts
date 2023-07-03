import { configStackName } from "../helpers/envHelper";
import { getS3Object } from "../helpers/s3Helper";

const configBucket = configStackName();

let e2eTestConfigRowsPromise: Promise<string | undefined>;

export const getE2ETestConfig = async (): Promise<E2ETestConfig> => {
  if (e2eTestConfigRowsPromise === undefined) {
    e2eTestConfigRowsPromise = getS3Object({
      bucket: configBucket,
      key: "e2e-test.json",
    });
  }
  return JSON.parse((await e2eTestConfigRowsPromise) ?? "");
};

export interface E2ETestConfig {
  parser_0_service_description: string;
  parser_0_toEmailId: string;
  parser_default_service_1: E2ETestParserServiceConfig;
  parser_default_service_2: E2ETestParserServiceConfig;
  parser_default_vendor_id: string;
}

export interface E2ETestParserServiceConfig {
  description: string;
  event_name: string;
}

import { configStackName } from "../helpers/envHelper";
import { getS3Object } from "../helpers/s3Helper";

const configBucket = configStackName();

export const getServiceDescriptionFromE2ETestConfig =
  async (): Promise<string> => {
    const response = await getS3Object({
      bucket: configBucket,
      key: "e2e-test.json",
    });
    const serviceDescription = JSON.parse(response ?? "");
    return serviceDescription.parser_0_service_description;
  };

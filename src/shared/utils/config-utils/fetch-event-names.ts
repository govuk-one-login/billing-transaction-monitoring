import { configStackName } from "../../../handlers/int-test-support/helpers/envHelper";
import { fetchVendorServiceConfig } from "./fetch-vendor-service-config";

export const fetchEventNames = async (): Promise<Set<string>> => {
  const vendorServiceConfig = await fetchVendorServiceConfig(configStackName());

  // eslint-disable-next-line @typescript-eslint/naming-convention
  return new Set(vendorServiceConfig.map(({ event_name }) => event_name));
};

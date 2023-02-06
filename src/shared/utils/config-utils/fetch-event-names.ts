import { fetchVendorServiceConfig } from "./fetch-vendor-service-config";

export const fetchEventNames = async (): Promise<Set<string>> => {
  const configBucket = process.env.CONFIG_BUCKET;

  if (configBucket === undefined)
    throw new Error("No CONFIG_BUCKET defined in this environment");

  const vendorServiceConfig = await fetchVendorServiceConfig(configBucket);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  return new Set(vendorServiceConfig.map(({ event_name }) => event_name));
};

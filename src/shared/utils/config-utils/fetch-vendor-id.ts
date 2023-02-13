import { fetchVendorServiceConfig } from "./fetch-vendor-service-config";

export const fetchVendorId = async (eventName: string): Promise<string> => {
  const configBucket = process.env.CONFIG_BUCKET;

  if (configBucket === undefined)
    throw new Error("No CONFIG_BUCKET defined in this environment");

  // Event name is unique for each vendor id
  const vendorServiceConfig = (
    await fetchVendorServiceConfig(configBucket)
  ).find((vendor) => vendor.event_name === eventName);

  if (vendorServiceConfig === undefined) {
    throw new Error(
      "Event name: " + eventName + " not found in vendorServiceConfig"
    );
  }
  return vendorServiceConfig.vendor_id;
};

import {
  fetchVendorServiceConfig,
  VendorServiceConfig,
} from "./fetch-vendor-service-config";

let vendorServiceConfigPromise: Promise<VendorServiceConfig> | undefined;

export const fetchVendorId = async (eventName: string): Promise<string> => {
  const configBucket = process.env.CONFIG_BUCKET;

  if (configBucket === undefined)
    throw new Error("No CONFIG_BUCKET defined in this environment");

  if (vendorServiceConfigPromise === undefined)
    vendorServiceConfigPromise = fetchVendorServiceConfig(configBucket);

  const vendorServiceConfig = await vendorServiceConfigPromise;

  // Event name is unique for each vendor id
  const vendorId = vendorServiceConfig.find(
    (vendor) => vendor.event_name === eventName
  );

  if (vendorId === undefined) {
    throw new Error(
      "Event name: " + eventName + " not found in vendorServiceConfig"
    );
  }
  return vendorId.vendor_id;
};

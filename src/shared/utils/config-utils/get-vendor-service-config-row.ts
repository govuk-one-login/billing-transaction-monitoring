import {
  fetchVendorServiceConfig,
  VendorServiceConfig,
  VendorServiceConfigRow,
} from "./fetch-vendor-service-config";

let vendorServiceConfigPromise: Promise<VendorServiceConfig> | undefined;

export const getMatchingVendorServiceConfigRows = async (
  configBucket: string,
  fields: Partial<VendorServiceConfigRow>
): Promise<VendorServiceConfigRow[]> => {
  if (vendorServiceConfigPromise === undefined)
    vendorServiceConfigPromise = fetchVendorServiceConfig(configBucket);

  const vendorServiceConfig = await vendorServiceConfigPromise;

  const matchingVendorServiceConfigRows = vendorServiceConfig.filter((row) =>
    Object.entries(fields).every(
      ([fieldName, fieldValue]) =>
        fieldValue === undefined ||
        row[fieldName as keyof VendorServiceConfigRow] === fieldValue
    )
  );

  if (matchingVendorServiceConfigRows.length === 0)
    throw Error("Vendor service config row not found");

  return matchingVendorServiceConfigRows;
};

/** Clear cached vendor service config, for testing purposes. */
export const clearVendorServiceConfig = (): void => {
  vendorServiceConfigPromise = undefined;
};

/** Set cached vendor service config, for testing purposes. */
export const setVendorServiceConfig = (
  newConfig: VendorServiceConfigRow[]
): void => {
  vendorServiceConfigPromise = new Promise((resolve) => resolve(newConfig));
};

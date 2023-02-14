import {
  fetchVendorServiceConfig,
  VendorServiceConfig,
  VendorServiceConfigRow,
} from "./fetch-vendor-service-config";

let vendorServiceConfigPromise: Promise<VendorServiceConfig> | undefined;

export type VendorServiceConfigRows = VendorServiceConfigRow[];

export const getVendorServiceConfigRows = async (
  configBucket: string,
  fields: Partial<VendorServiceConfigRow>
): Promise<VendorServiceConfigRows> => {
  if (vendorServiceConfigPromise === undefined)
    vendorServiceConfigPromise = fetchVendorServiceConfig(configBucket);

  const vendorServiceConfig = await vendorServiceConfigPromise;

  const vendorServiceConfigRows = vendorServiceConfig.filter((row) =>
    Object.entries(fields).every(
      ([fieldName, fieldValue]) =>
        fieldValue === undefined ||
        row[fieldName as keyof VendorServiceConfigRow] === fieldValue
    )
  );

  if (!vendorServiceConfigRows.length)
    throw new Error("No vendor service config rows found");

  return vendorServiceConfigRows;
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

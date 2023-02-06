import {
  fetchVendorServiceConfig,
  VendorServiceConfig,
  VendorServiceConfigRow,
} from "./fetch-vendor-service-config";

let vendorServiceConfigPromise: Promise<VendorServiceConfig> | undefined;

export const getVendorServiceConfigRow = async (
  configBucket: string,
  fields: Partial<VendorServiceConfigRow>
): Promise<VendorServiceConfigRow> => {
  console.log(vendorServiceConfigPromise);
  if (vendorServiceConfigPromise === undefined)
    vendorServiceConfigPromise = fetchVendorServiceConfig(configBucket);

  const vendorServiceConfig = await vendorServiceConfigPromise;

  const vendorServiceConfigRow = vendorServiceConfig.find((row) =>
    Object.entries(fields).every(
      ([fieldName, fieldValue]) =>
        fieldValue === undefined ||
        row[fieldName as keyof VendorServiceConfigRow] === fieldValue
    )
  );

  if (vendorServiceConfigRow === undefined)
    throw Error("Vendor service config row not found");

  return { ...vendorServiceConfigRow };
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

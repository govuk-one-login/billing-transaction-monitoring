import { fetchVendorServiceConfig } from "./fetch-vendor-service-config";

export interface VendorServiceConfigRow {
  vendor_name: string;
  vendor_regex: string;
  client_id: string;
  service_name: string;
  service_regex: string;
  event_name: string;
}

let vendorServiceConfigPromise: Promise<VendorServiceConfigRow[]> | undefined;

export const getVendorServiceConfigRow = async (
  configBucket: string,
  fields: Partial<VendorServiceConfigRow>
): Promise<VendorServiceConfigRow> => {
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

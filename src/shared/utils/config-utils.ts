import getCsvConverter from "csvtojson";
import { VENDOR_SERVICE_CONFIG_PATH } from "../constants";
import { fetchS3 } from "./s3";

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

const fetchVendorServiceConfig = async (
  configBucket: string
): Promise<VendorServiceConfigRow[]> => {
  const vendorServiceConfigText = await fetchS3(
    configBucket,
    VENDOR_SERVICE_CONFIG_PATH
  );

  if (vendorServiceConfigText === undefined)
    throw Error("No vendor service config found");

  const csvConverter = getCsvConverter();

  const vendorServiceConfig = await csvConverter.fromString(
    vendorServiceConfigText
  );

  if (!vendorServiceConfig.every(isVendorServiceConfigRow))
    throw new Error("Invalid vendor service config");

  return vendorServiceConfig;
};

const isVendorServiceConfigRow = (x: any): x is VendorServiceConfigRow =>
  typeof x === "object" &&
  typeof x.vendor_name === "string" &&
  typeof x.vendor_regex === "string" &&
  typeof x.client_id === "string" &&
  typeof x.service_name === "string" &&
  typeof x.service_regex === "string" &&
  typeof x.event_name === "string";

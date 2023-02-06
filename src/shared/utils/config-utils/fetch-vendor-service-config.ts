import getCsvConverter from "csvtojson";
import { VENDOR_SERVICE_CONFIG_PATH } from "../../constants";
import { fetchS3 } from "../s3";

export interface VendorServiceConfigRow {
  vendor_name: string;
  vendor_regex: string;
  client_id: string;
  service_name: string;
  service_regex: string;
  event_name: string;
}

export type VendorServiceConfig = VendorServiceConfigRow[];

export const fetchVendorServiceConfig = async (
  configBucket: string
): Promise<VendorServiceConfig> => {
  const vendorServiceConfigText = await fetchS3(
    configBucket,
    VENDOR_SERVICE_CONFIG_PATH
  );

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

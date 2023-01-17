import getCsvConverter from "csvtojson";
import { getS3Object } from "./s3Helper";
import { configStackName } from "./envHelper";

interface VendorServiceConfigRow {
  vendor_name: string;
  vendor_regex: string;
  client_id: string;
  service_name: string;
  service_regex: string;
  event_name: string;
}

let cachedVendorServiceConfig: VendorServiceConfigRow[] | undefined;

export const getVendorServiceConfigRow = async (
  fields: Partial<VendorServiceConfigRow>
): Promise<VendorServiceConfigRow> => {
  if (cachedVendorServiceConfig === undefined) {
    const vendorServiceConfigText = await getS3Object({
      bucket: configStackName(),
      key: "vendor_services/vendor-services.csv",
    });

    if (vendorServiceConfigText === undefined)
      throw Error("No vendor service config found");

    const csvConverter = getCsvConverter();

    const vendorServiceConfig = await csvConverter.fromString(
      vendorServiceConfigText
    );

    if (!vendorServiceConfig.every(isVendorServiceConfigRow))
      throw new Error("Invalid vendor service config");

    cachedVendorServiceConfig = vendorServiceConfig;
  }

  const vendorServiceConfigRow = cachedVendorServiceConfig.find((row) =>
    Object.entries(fields).every(
      ([fieldName, fieldValue]) =>
        fieldValue === undefined ||
        row[fieldName as keyof VendorServiceConfigRow] === fieldValue
    )
  );

  if (vendorServiceConfigRow === undefined)
    throw Error("Vendor service config row not found");

  return vendorServiceConfigRow;
};

const isVendorServiceConfigRow = (x: any): x is VendorServiceConfigRow =>
  typeof x === "object" &&
  typeof x.vendor_name === "string" &&
  typeof x.vendor_regex === "string" &&
  typeof x.client_id === "string" &&
  typeof x.service_name === "string" &&
  typeof x.service_regex === "string" &&
  typeof x.event_name === "string";

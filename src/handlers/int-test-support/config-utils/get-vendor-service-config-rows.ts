import { getS3Object } from "../helpers/s3Helper";
import csvtojson from "csvtojson";
import { VENDOR_SERVICE_CONFIG_PATH } from "../test-constants";

export type VendorServiceRows = VendorServiceRow[];

let vendorServiceRowsPromise: Promise<string | undefined>;

export interface VendorServiceRow {
  vendor_name: string;
  vendor_id: string;
  service_name: string;
  service_regex: string;
  event_name: string;
}

export const getVendorServiceConfigRows = async (
  configBucket: string,
  fields: Partial<VendorServiceRow>
): Promise<VendorServiceRows> => {
  if (vendorServiceRowsPromise === undefined) {
    vendorServiceRowsPromise = getS3Object({
      bucket: configBucket,
      key: VENDOR_SERVICE_CONFIG_PATH,
    });
  }

  const vendorServiceConfigText = await vendorServiceRowsPromise;
  if (vendorServiceConfigText === "" || vendorServiceConfigText === undefined) {
    throw new Error("No vendor service config found");
  }
  const csvConverter = csvtojson();
  const vendorServiceConfig = await csvConverter.fromString(
    vendorServiceConfigText
  );

  const vendorServiceConfigRows = vendorServiceConfig.filter((row) =>
    Object.entries(fields).every(
      ([fieldName, fieldValue]) =>
        fieldValue === undefined ||
        row[fieldName as keyof VendorServiceRow] === fieldValue
    )
  );

  if (!vendorServiceConfigRows.length)
    throw new Error("No vendor service config rows found");

  return vendorServiceConfigRows;
};

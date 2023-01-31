import { VENDOR_INVOICE_STANDARDISATION_CONFIG_PATH } from "../../constants";
import { fetchS3 } from "../s3";

export interface VendorInvoiceStandardisationConfigItem {
  clientId: string;
  invoiceStandardisationModuleId: number;
}

let configPromise:
  | Promise<VendorInvoiceStandardisationConfigItem[]>
  | undefined;

export const getVendorInvoiceStandardisationModuleId = async (
  configBucket: string,
  clientId: string
): Promise<number | undefined> => {
  if (configPromise === undefined) configPromise = fetchConfig(configBucket);
  const configItems = await configPromise;
  const configItem = configItems.find((item) => item.clientId === clientId);
  return configItem?.invoiceStandardisationModuleId;
};

/** Clear cached vendor invoice standardisation config, for testing purposes. */
export const clearVendorInvoiceStandardisationConfig = (): void => {
  configPromise = undefined;
};

/** Set cached vendor invoice standardisation config, for testing purposes. */
export const setVendorInvoiceStandardisationConfig = (
  newConfig: VendorInvoiceStandardisationConfigItem[]
): void => {
  configPromise = new Promise((resolve) => resolve(newConfig));
};

const fetchConfig = async (
  configBucket: string
): Promise<VendorInvoiceStandardisationConfigItem[]> => {
  const configText = await fetchS3(
    configBucket,
    VENDOR_INVOICE_STANDARDISATION_CONFIG_PATH
  );

  if (configText === undefined)
    throw Error("No vendor invoice standardisation config found");

  let config;
  try {
    config = JSON.parse(configText);
  } catch {
    throw Error("Vendor invoice standardisation config not valid JSON");
  }

  if (!Array.isArray(config))
    throw Error("Vendor invoice standardisation config not array");

  if (!config.every(isConfigItem))
    throw Error("Invalid vendor invoice standardisation config");

  return config;
};

const isConfigItem = (x: any): x is VendorInvoiceStandardisationConfigItem =>
  typeof x === "object" &&
  typeof x.clientId === "string" &&
  typeof x.invoiceStandardisationModuleId === "number";

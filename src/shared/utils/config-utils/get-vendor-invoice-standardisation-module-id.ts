import { ConfigElements } from "../../constants";
import { getConfig } from "./get-config";

export const getVendorInvoiceStandardisationModuleId = async (
  vendorId: string
): Promise<number | undefined> => {
  const configItems = await getConfig(ConfigElements.standardisation);
  const configItem = configItems.find((item) => item.vendorId === vendorId);
  return configItem?.invoiceStandardisationModuleId;
};

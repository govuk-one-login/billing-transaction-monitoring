import { ConfigElements } from "../../constants";
import { ConfigServicesRow } from "../../types";
import { getConfig } from "./get-config";

export const getVendorServiceConfigRows = async (
  fields: Partial<ConfigServicesRow>
): Promise<ConfigServicesRow[]> => {
  const vendorServiceConfig = await getConfig(ConfigElements.services);

  const vendorServiceConfigRows = vendorServiceConfig.filter((row) =>
    Object.entries(fields).every(
      ([fieldName, fieldValue]) =>
        fieldValue === undefined ||
        row[fieldName as keyof ConfigServicesRow] === fieldValue
    )
  );

  if (!vendorServiceConfigRows.length)
    throw new Error("No vendor service config rows found");

  return vendorServiceConfigRows;
};

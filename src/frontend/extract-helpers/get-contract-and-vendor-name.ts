import { ConfigElements } from "../../shared/constants";
import { getConfig } from "../../shared/utils";

export const getContractAndVendorName = async (
  contractId: string
): Promise<{ vendorName: string; contractName: string }> => {
  const [services, contracts] = await Promise.all([
    getConfig(ConfigElements.services, { withCache: false }),
    getConfig(ConfigElements.contracts, { withCache: false }),
  ]);

  const contract = contracts.find((contract) => contract.id === contractId);

  if (contract === undefined) {
    throw new Error("No contract found");
  }

  const vendorName =
    services.find((svc) => svc.vendor_id === contract.vendor_id)?.vendor_name ??
    "";

  return { vendorName, contractName: contract.name };
};

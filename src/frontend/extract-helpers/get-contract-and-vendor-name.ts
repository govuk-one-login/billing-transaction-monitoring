import { ConfigElements } from "../../handler-context";
import { makeCtxConfig } from "../../handler-context/context-builder";

export const getContractAndVendorName = async (
  contractId: string
): Promise<{ vendorName: string; contractName: string }> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);

  const contract = config.contracts.find(
    (contract) => contract.id === contractId
  );

  if (contract === undefined) {
    throw new Error("No contract found");
  }

  const vendorName =
    config.services.find((svc) => svc.vendor_id === contract.vendor_id)
      ?.vendor_name ?? "";

  return { vendorName, contractName: contract.name };
};

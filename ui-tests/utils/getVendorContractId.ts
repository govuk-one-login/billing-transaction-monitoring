import { getContractsFromConfig } from "../../src/handlers/int-test-support/config-utils/get-contract-config-rows";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper";

export const getVendorContractIdFromConfig = async (
  vendorId: string
): Promise<number> => {
  const configBucket = configStackName();
  const contractsConfigRows = await getContractsFromConfig(configBucket);
  const contractWithVendor = contractsConfigRows.find(
    (contract) => contract.vendor_id === vendorId
  );
  if (!contractWithVendor) {
    throw new Error(`Contract not found for vendor: ${vendorId}`);
  }
  const contractId = contractWithVendor.id;
  return contractId;
};

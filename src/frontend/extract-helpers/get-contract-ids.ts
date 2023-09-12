import { ConfigElements } from "../../shared/constants";
import { getConfig } from "../../shared/utils";

export const getContractIds = async (): Promise<string[]> => {
  const contracts = await getConfig(ConfigElements.contracts, {
    withCache: false,
  });

  return contracts.map((contract) => contract.id);
};

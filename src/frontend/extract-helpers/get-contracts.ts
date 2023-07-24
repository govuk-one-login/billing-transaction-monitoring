import { ConfigElements } from "../../shared/constants";
import { getConfig } from "../../shared/utils";

export type Contract = { id: string; name: string; vendorName: string };

export const getContracts = async (): Promise<Contract[]> => {
  const [services, contracts] = await Promise.all([
    getConfig(ConfigElements.services),
    getConfig(ConfigElements.contracts),
  ]);

  return contracts.map((contract) => {
    return {
      id: contract.id,
      name: contract.name,
      vendorName:
        services.find((svc) => svc.vendor_id === contract.vendor_id)
          ?.vendor_name ?? "",
    };
  });
};

import { ConfigElements } from "../../handler-context";
import { makeCtxConfig } from "../../handler-context/context-builder";

export const getContracts = async (): Promise<
  Array<{
    id: string;
    name: string;
    vendorName: string;
  }>
> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);

  return config.contracts.map((contract) => {
    return {
      id: contract.id,
      name: contract.name,
      vendorName:
        config.services.find((svc) => svc.vendor_id === contract.vendor_id)
          ?.vendor_name ?? "",
    };
  });
};

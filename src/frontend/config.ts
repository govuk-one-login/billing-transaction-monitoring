import { ConfigElements } from "../handler-context";
import { makeCtxConfig } from "../handler-context/context-builder";

// TODO Figure out caching
export const getContracts = async (): Promise<
  Array<{
    name: string;
    contract_id: string;
  }>
> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);
  return config.contracts.map((contract) => {
    return {
      name: `${contract.name} - ${
        config.services.find((svc) => svc.vendor_id === contract.vendor_id)
          ?.vendor_name
      }`,
      contract_id: contract.id,
    };
  });
};

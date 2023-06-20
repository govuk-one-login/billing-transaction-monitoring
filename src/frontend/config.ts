import { ConfigElements } from "../handler-context";
import { makeCtxConfig } from "../handler-context/context-builder";

const config = await makeCtxConfig([
  ConfigElements.services,
  ConfigElements.contracts,
]);

export const contracts = config.contracts.map((contract) => {
  return {
    name: `${contract.name} - ${
      config.services.find((svc) => svc.vendor_id === contract.vendor_id)
        ?.vendor_name
    }`,
    contract_id: contract.id,
  };
});

export const getContractName = (id: string): string => {
  const contract = config.contracts.find((contract) => contract.id === id);
  if (contract === undefined) {
    throw new Error("No contract found");
  }
  return `${contract.name} - ${
    config.services.find((svc) => svc.vendor_id === contract.vendor_id)
      ?.vendor_name
  }`;
};

// Write getContractData which will return the display name and all the months/years

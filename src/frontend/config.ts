import { ConfigElements } from "../handler-context";
import { makeCtxConfig } from "../handler-context/context-builder";

const config = await makeCtxConfig([
  ConfigElements.services,
  ConfigElements.contracts,
]);

console.log(config);
export const contracts = config.contracts.map((contract) => {
  return {
    name: `${contract.name} - ${
      config.services.find((svc) => svc.vendor_id === contract.vendor_id)
        ?.vendor_name
    }`,
    contract_id: contract.id,
  };
});

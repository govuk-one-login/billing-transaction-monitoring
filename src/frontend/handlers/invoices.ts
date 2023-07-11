import { getContractAndVendorName } from "../config";
import { getContractPeriods } from "../extract-helper";
import { PageParamsGetter } from "../pages";

export const invoicesParamsGetter: PageParamsGetter<{
  contract_id: string;
}> = async (request) => {
  console.log(request);
  const [{ contractName, vendorName }, periods] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getContractPeriods(request.params.contract_id),
  ]);

  return {
    pageTitle: contractName + " - " + vendorName,
    contract: {
      id: request.params.contract_id,
      name: contractName,
      vendorName,
    },
    periods,
  };
};

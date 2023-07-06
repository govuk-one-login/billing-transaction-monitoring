import { getContractAndVendorName } from "../config";
import { getContractPeriods } from "../extract-helper";
import { PageParamsGetter } from "../pages";

export const invoicesParamsGetter: PageParamsGetter<{
  contract_id: string;
}> = async (request) => {
  const [{ contractName, vendorName }, periods] = await Promise.all([
    getContractAndVendorName(request.query.contract_id),
    getContractPeriods(request.query.contract_id),
  ]);

  return {
    contract: {
      id: request.query.contract_id,
      name: contractName,
      vendorName,
    },
    periods,
  };
};

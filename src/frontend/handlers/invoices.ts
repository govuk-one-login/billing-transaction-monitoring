import {
  getContractAndVendorName,
  getContractPeriods,
} from "../extract-helpers";
import { InvoicesParams, PageParamsGetter } from "../pages";

export const invoicesParamsGetter: PageParamsGetter<
  {
    contract_id: string;
  },
  InvoicesParams
> = async (request) => {
  const [{ contractName, vendorName }, periods] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getContractPeriods(request.params.contract_id),
  ]);

  return {
    contract: {
      id: request.params.contract_id,
      name: contractName,
      vendorName,
    },
    periods,
  };
};

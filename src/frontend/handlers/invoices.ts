import {
  getContractAndVendorName,
  getContractPeriods,
} from "../extract-helpers";
import {
  InvoicesParams,
  InvoicesRequestParams,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";

export const invoicesParamsGetter: PageParamsGetter<
  InvoicesRequestParams,
  InvoicesParams
> = async (request) => {
  const [{ contractName, vendorName }, periods] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getContractPeriods(request.params.contract_id),
  ]);

  return {
    pageTitle: await invoicesTitleGetter(request.params),
    contract: {
      id: request.params.contract_id,
      name: contractName,
      vendorName,
    },
    periods,
  };
};

export const invoicesTitleGetter: PageTitleGetter<
  InvoicesRequestParams
> = async ({ contract_id }) => {
  const { contractName, vendorName } = await getContractAndVendorName(
    contract_id
  );

  return contractName + " - " + vendorName;
};

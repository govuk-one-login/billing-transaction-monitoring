import {
  getContractAndVendorName,
  getContractPeriods,
} from "../extract-helpers";
import {
  PageParamsGetter,
  PageTitleGetter,
  getUrl,
  invoicePage,
} from "../pages";
import { LinkData } from "../utils";

export type InvoicesRequestParams = { contract_id: string };

export type InvoicesParams = {
  invoiceLinksData: LinkData[];
};

export const invoicesParamsGetter: PageParamsGetter<
  InvoicesRequestParams,
  InvoicesParams
> = async (request) => {
  const periods = await getContractPeriods(request.params.contract_id);

  return {
    invoiceLinksData: periods.map(({ month, prettyMonth, year }) => ({
      href: getUrl(invoicePage, { ...request.params, month, year }),
      text: `${prettyMonth} ${year}`,
    })),
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

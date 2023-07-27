import {
  getContractAndVendorName,
  getContractPeriods,
} from "../extract-helpers";
import {
  InvoicesParams,
  InvoicesRequestParams,
  PageParamsGetter,
  PageTitleGetter,
  getUrl,
  invoicePage,
  cookiesPage,
} from "../pages";
import { getLinkData } from "../utils";

export const invoicesParamsGetter: PageParamsGetter<
  InvoicesRequestParams,
  InvoicesParams
> = async (request) => {
  const [pageTitle, cookiesLink, periods] = await Promise.all([
    invoicesTitleGetter(request.params),
    getLinkData(cookiesPage, request.params),
    getContractPeriods(request.params.contract_id),
  ]);

  return {
    invoiceLinksData: periods.map(({ month, prettyMonth, year }) => ({
      href: getUrl(invoicePage, { ...request.params, month, year }),
      text: `${prettyMonth} ${year}`,
    })),
    cookiesLink,
    pageTitle,
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

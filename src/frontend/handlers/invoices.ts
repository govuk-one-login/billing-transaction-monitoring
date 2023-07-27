import {
  getContractAndVendorName,
  getContractPeriods,
} from "../extract-helpers";
import {
  PageParamsGetter,
  PageTitleGetter,
  getUrl,
  invoicePage,
  cookiesPage,
  BaseParams,
} from "../pages";
import { getLinkData, LinkData } from "../utils";

export type InvoicesRequestParams = { contract_id: string };

export type InvoicesParams = BaseParams & {
  invoiceLinksData: LinkData[];
};

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

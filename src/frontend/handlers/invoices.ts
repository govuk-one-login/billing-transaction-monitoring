import { getMonthQuarter } from "../../shared/utils";
import {
  Period,
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
    invoiceLinksData: periods.map((period) =>
      getInvoiceLinkData(request.params, period)
    ),
  };
};

const getInvoiceLinkData = (
  invoicesRequestParams: InvoicesRequestParams,
  { isQuarter, month, prettyMonth, year }: Period
): LinkData => {
  const quarter = isQuarter ? getMonthQuarter(month) : undefined;

  return {
    href: getUrl(invoicePage, {
      ...invoicesRequestParams,
      monthOrQuarter: quarter ?? month,
      year,
    }),
    text: `${quarter ?? prettyMonth} ${year}`,
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

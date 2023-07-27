import { getLinkData, MONTHS } from "../utils";
import {
  getContractAndVendorName,
  getInvoiceBanner,
  getLineItems,
  getReconciliationRows,
  getTotals,
  ReconciliationRow,
} from "../extract-helpers";
import {
  BaseParams,
  cookiesPage,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";

export type InvoiceRequestParams = {
  contract_id: string;
  year: string;
  month: string;
};

export type InvoiceParams = BaseParams & {
  vendorName: string;
  contractName: string;
  contractId: string;
  year: string;
  prettyMonth: string;
  bannerClass: string;
  invoiceStatus: string;
  reconciliationRows: ReconciliationRow[];
  invoiceTotals: {
    billingPriceTotal: string;
    billingPriceInclVatTotal: string;
  };
};

export const invoiceParamsGetter: PageParamsGetter<
  InvoiceRequestParams,
  InvoiceParams
> = async (request) => {
  const [pageTitle, cookiesLink, config, lineItems] = await Promise.all([
    invoiceTitleGetter(request.params),
    getLinkData(cookiesPage, request.params),
    getContractAndVendorName(request.params.contract_id),
    getLineItems(
      request.params.contract_id,
      request.params.year,
      request.params.month
    ),
  ]);

  const invoiceBanner = getInvoiceBanner(lineItems);

  const reconciliationRows = getReconciliationRows(lineItems);

  const invoiceTotals = getTotals(reconciliationRows);

  return {
    pageTitle,
    cookiesLink,
    vendorName: config.vendorName,
    contractName: config.contractName,
    contractId: request.params.contract_id,
    year: request.params.year,
    prettyMonth: MONTHS[Number(request.params.month) - 1],
    bannerClass: invoiceBanner.bannerClass,
    invoiceStatus: invoiceBanner.status,
    reconciliationRows,
    invoiceTotals,
  };
};

export const invoiceTitleGetter: PageTitleGetter<
  InvoiceRequestParams
> = async ({ contract_id, year, month }) => {
  const { vendorName } = await getContractAndVendorName(contract_id);
  return `${vendorName} ${MONTHS[Number(month) - 1]} ${year} Invoice`;
};

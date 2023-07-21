import { MONTHS } from "../utils";
import {
  getContractAndVendorName,
  getInvoiceBanner,
  getLineItems,
  getReconciliationRows,
  getTotals,
} from "../extract-helpers";
import {
  InvoiceParams,
  InvoiceRequestParams,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";

export const invoiceParamsGetter: PageParamsGetter<
  InvoiceRequestParams,
  InvoiceParams
> = async (request) => {
  const [config, lineItems, pageTitle] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getLineItems(
      request.params.contract_id,
      request.params.year,
      request.params.month
    ),
    invoiceTitleGetter(request.params),
  ]);

  const invoiceBanner = getInvoiceBanner(lineItems);

  const reconciliationRows = getReconciliationRows(lineItems);

  const invoiceTotals = getTotals(reconciliationRows);

  return {
    pageTitle,
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

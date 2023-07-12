import { MONTHS } from "../utils";
import {
  getContractAndVendorName,
  getInvoiceBanner,
  getLineItems,
  getReconciliationRows,
} from "../extract-helpers";
import { InvoiceParams, PageParamsGetter } from "../pages";

export const invoiceParamsGetter: PageParamsGetter<
  {
    contract_id: string;
    year: string;
    month: string;
  },
  InvoiceParams
> = async (request) => {
  const [config, lineItems] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getLineItems(
      request.params.contract_id,
      request.params.year,
      request.params.month
    ),
  ]);

  const invoiceBanner = getInvoiceBanner(lineItems);

  const reconciliationRows = getReconciliationRows(lineItems);

  return {
    vendorName: config.vendorName,
    contractName: config.contractName,
    contractId: request.params.contract_id,
    year: request.params.year,
    prettyMonth: MONTHS[Number(request.params.month) - 1],
    bannerClass: invoiceBanner.bannerClass,
    invoiceStatus: invoiceBanner.status,
    reconciliationRows,
  };
};

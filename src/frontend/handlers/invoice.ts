import { InvoiceStatus, MONTHS } from "../utils";
import {
  getContractAndVendorName,
  getInvoiceStatus,
  getLineItems,
  getReconciliationRows,
  getTotals,
  ReconciliationRow,
} from "../extract-helpers";
import { PageParamsGetter, PageTitleGetter } from "../pages";

export type InvoiceRequestParams = {
  contract_id: string;
  year: string;
  month: string;
};

export type InvoiceParams = {
  vendorName: string;
  contractName: string;
  contractId: string;
  year: string;
  prettyMonth: string;
  invoiceStatus: InvoiceStatus;
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
  const [config, lineItems] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getLineItems(
      request.params.contract_id,
      request.params.year,
      request.params.month
    ),
  ]);

  const invoiceStatus = getInvoiceStatus(lineItems);

  const reconciliationRows = getReconciliationRows(lineItems);

  const invoiceTotals = getTotals(reconciliationRows);

  return {
    vendorName: config.vendorName,
    contractName: config.contractName,
    contractId: request.params.contract_id,
    year: request.params.year,
    prettyMonth: MONTHS[Number(request.params.month) - 1],
    invoiceStatus,
    reconciliationRows,
    invoiceTotals,
  };
};

export const invoiceTitleGetter: PageTitleGetter<
  InvoiceRequestParams
> = async ({ contract_id, year, month }) => {
  const { vendorName, contractName } = await getContractAndVendorName(
    contract_id
  );
  return `${contractName} - ${vendorName} (${
    MONTHS[Number(month) - 1]
  } ${year}) reconciliation`;
};

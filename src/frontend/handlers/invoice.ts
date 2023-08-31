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
import { getQuarterMonth, isQuarter } from "../../shared/utils";

export type InvoiceRequestParams = {
  contract_id: string;
  year: string;
  monthOrQuarter: string;
};

export type InvoiceParams = {
  vendorName: string;
  contractName: string;
  contractId: string;
  year: string;
  prettyMonthOrQuarter: string;
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
  const monthOrQuarter = request.params.monthOrQuarter.toUpperCase();
  const invoiceIsQuarterly = isQuarter(monthOrQuarter);

  const month = invoiceIsQuarterly
    ? getQuarterMonth(monthOrQuarter)
    : parseInt(monthOrQuarter, 10);

  const quarter = invoiceIsQuarterly ? monthOrQuarter : undefined;

  const [config, lineItems] = await Promise.all([
    getContractAndVendorName(request.params.contract_id),
    getLineItems(
      request.params.contract_id,
      request.params.year,
      month,
      invoiceIsQuarterly
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
    prettyMonthOrQuarter: quarter ?? MONTHS[month - 1],
    invoiceStatus,
    reconciliationRows,
    invoiceTotals,
  };
};

export const invoiceTitleGetter: PageTitleGetter<InvoiceRequestParams> = async (
  requestParams
) => {
  const { contract_id, year } = requestParams;
  const monthOrQuarter = requestParams.monthOrQuarter.toUpperCase();

  const { vendorName, contractName } = await getContractAndVendorName(
    contract_id
  );

  const prettyMonthOrQuarter = isQuarter(monthOrQuarter)
    ? monthOrQuarter
    : MONTHS[Number(monthOrQuarter) - 1];

  return `${contractName} - ${vendorName} (${prettyMonthOrQuarter} ${year}) reconciliation`;
};

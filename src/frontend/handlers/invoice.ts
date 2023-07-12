import { getContractAndVendorName } from "../config";
import { getLineItems, getReconciliationRows } from "../extract-helper";
import {
  MN_EVENTS_MISSING,
  MN_INVOICE_MISSING,
  MN_RATES_MISSING,
  MN_UNEXPECTED_CHARGE,
  MONTHS,
  PercentageDiscrepancySpecialCase,
} from "../frontend-utils";
import { InvoiceParams, PageParamsGetter } from "../pages";

// Note that these are just the special cases that we want to show a warning for --
// MN_NO_CHARGE is also a possible value in a line item but, it doesn't cause a warning.
const WARNINGS_BY_PRIORITY = [
  MN_INVOICE_MISSING,
  MN_EVENTS_MISSING,
  MN_RATES_MISSING,
  MN_UNEXPECTED_CHARGE,
];

const WARNING_CODES = WARNINGS_BY_PRIORITY.map(
  (warning) => warning.magicNumber
);

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

  let status;
  let bannerClass;
  if (lineItems.length === 0) {
    status = "Invoice and events missing";
    bannerClass = "warning";
  } else if (
    lineItems.find((lineItem) =>
      WARNING_CODES.includes(lineItem.price_difference_percentage)
    )
  ) {
    // We know at this point that at least one line item contains a warning, but
    // we want to find the one with the highest priority warning.
    const highestPriorityWarning: PercentageDiscrepancySpecialCase | undefined =
      WARNINGS_BY_PRIORITY.find((warning) =>
        lineItems.find(
          (lineItem) =>
            lineItem.price_difference_percentage === warning.magicNumber
        )
      );
    if (!highestPriorityWarning) {
      throw new Error("Couldn't find line item with warning");
    }
    status = highestPriorityWarning.bannerText;
    bannerClass = "warning";
  } else if (
    lineItems.find((lineItem) => +lineItem.price_difference_percentage >= 1)
  ) {
    status = "Invoice above threshold";
    bannerClass = "error";
  } else if (
    lineItems.find((lineItem) => +lineItem.price_difference_percentage <= -1)
  ) {
    status = "Invoice below threshold";
    bannerClass = "notice";
  } else {
    status = "Invoice within threshold";
    bannerClass = "payable";
  }

  const reconciliationRows = getReconciliationRows(lineItems);

  return {
    classes: bannerClass,
    invoice: {
      status,
      vendorName: config.vendorName,
      contractName: config.contractName,
      contractId: request.params.contract_id,
      year: request.params.year,
      prettyMonth: MONTHS[Number(request.params.month) - 1],
      month: request.params.month,
    },
    reconciliationRows,
  };
};

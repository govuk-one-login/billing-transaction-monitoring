import { fetchS3 } from "../shared/utils";
import {
  MN_EVENTS_MISSING,
  MN_INVOICE_MISSING,
  MN_NO_CHARGE,
  MN_RATES_MISSING,
  MN_UNEXPECTED_CHARGE,
  MONTHS,
  PercentageDiscrepancySpecialCase,
  STATUS_LABEL_ABOVE_THRESHOLD,
  STATUS_LABEL_BELOW_THRESHOLD,
  STATUS_LABEL_WITHIN_THRESHOLD,
  StatusLabel,
} from "./frontend-utils";

export const getContractPeriods = async (
  contractId: string
): Promise<Array<{ month: string; year: string; prettyMonth: string }>> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData
    .filter((row) => row.contract_id === contractId)
    .map((row) => ({
      year: row.year,
      month: row.month,
      prettyMonth: MONTHS[Number(row.month) - 1],
    }))
    .filter(
      (row, i, rows) =>
        rows.findIndex((r) => r.month === row.month && r.year === row.year) ===
        i
    ) // removes duplicates
    .sort((a, b) => {
      if (a.year === b.year) {
        return +a.month - +b.month;
      } else {
        return +a.year - +b.year;
      }
    });
};

interface FullExtractLineItem {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: string;
  contract_name: string;
  year: string;
  month: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: string;
}

export const getLineItems = async (
  contractId: string,
  year: string,
  month: string
): Promise<FullExtractLineItem[]> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData.filter(
    (row) =>
      row.contract_id === contractId && row.year === year && row.month === month
  );
};

const getDashboardExtract = async (): Promise<FullExtractLineItem[]> => {
  if (process.env.STORAGE_BUCKET === undefined)
    throw new Error("No STORAGE_BUCKET defined in this environment");

  const extract = await fetchS3(
    process.env.STORAGE_BUCKET,
    "btm_extract_data/full-extract.json"
  );

  const jsonArray = "[" + extract.replace(/\n/g, ",") + "]";
  return JSON.parse(jsonArray);
};

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

interface InvoiceBanner {
  status: string;
  bannerClass: string;
}

export const getInvoiceBanner = (
  lineItems: FullExtractLineItem[]
): InvoiceBanner => {
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
  return {
    status,
    bannerClass,
  };
};
interface ReconciliationRow {
  serviceName: string;
  quantityDiscrepancy: string;
  priceDiscrepancy: string;
  percentageDiscrepancy: string;
  status: StatusLabel;
  billingQuantity: string;
  transactionQuantity: string;
  billingPrice: string;
  transactionPrice: string;
}

const PERCENTAGE_DISCREPANCY = [
  MN_NO_CHARGE,
  MN_INVOICE_MISSING,
  MN_EVENTS_MISSING,
  MN_RATES_MISSING,
  MN_UNEXPECTED_CHARGE,
];

const getPercentageDiscrepancyMessage = (
  percentageDiscrepancy: string
): string => {
  return (
    PERCENTAGE_DISCREPANCY.find(
      (discrepancy) => discrepancy.magicNumber === percentageDiscrepancy
    )?.bannerText ?? percentageDiscrepancy + "%"
  );
};

const getQuantity = (
  quantity: string,
  percentageDiscrepancy: string
): string => {
  return quantity !== ""
    ? quantity
    : PERCENTAGE_DISCREPANCY.find(
        (discrepancy) => discrepancy.magicNumber === percentageDiscrepancy
      )?.bannerText ?? "";
};

const getPrice = (price: string, percentageDiscrepancy: string): string => {
  return price !== ""
    ? price
    : PERCENTAGE_DISCREPANCY.find(
        (discrepancy) => discrepancy.magicNumber === percentageDiscrepancy
      )?.bannerText ?? "";
};

const getStatus = (percentageDiscrepancy: string): StatusLabel => {
  const warning = PERCENTAGE_DISCREPANCY.find(
    (discrepancy) => discrepancy.magicNumber === percentageDiscrepancy
  );
  if (warning) return warning.statusLabel;
  if (+percentageDiscrepancy >= 1) return STATUS_LABEL_ABOVE_THRESHOLD;
  if (+percentageDiscrepancy <= -1) return STATUS_LABEL_BELOW_THRESHOLD;
  return STATUS_LABEL_WITHIN_THRESHOLD;
};

export const getReconciliationRows = (
  lineItems: FullExtractLineItem[]
): ReconciliationRow[] => {
  const rows = [];
  for (const item of lineItems) {
    const row = {
      serviceName: item.service_name,
      quantityDiscrepancy: item.quantity_difference,
      priceDiscrepancy: item.price_difference,
      percentageDiscrepancy: getPercentageDiscrepancyMessage(
        item.price_difference_percentage
      ),
      status: getStatus(item.price_difference_percentage),
      billingQuantity: getQuantity(
        item.billing_quantity,
        item.price_difference_percentage
      ),
      transactionQuantity: getQuantity(
        item.transaction_quantity,
        item.price_difference_percentage
      ),
      billingPrice: getPrice(
        item.billing_price_formatted,
        item.price_difference_percentage
      ),
      transactionPrice: getPrice(
        item.transaction_price_formatted,
        item.price_difference_percentage
      ),
    };
    rows.push(row);
  }
  return rows;
};

import { percentageDiscrepancySpecialCase, statusLabels } from "../utils";
import { FullExtractLineItem } from "./types";

export interface ReconciliationRow {
  serviceName: string;
  quantityDiscrepancy: string;
  priceDiscrepancy: string;
  percentageDiscrepancy: string;
  status: { message: string; class: string };
  billingQuantity: string;
  transactionQuantity: string;
  billingUnitPrice: string;
  billingPrice: string;
  billingPriceInclVat: string;
  transactionPrice: string;
}

export const getReconciliationRows = (
  lineItems: FullExtractLineItem[]
): ReconciliationRow[] => {
  const rows: ReconciliationRow[] = [];
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
      billingUnitPrice: getPrice(
        item.billing_unit_price,
        item.price_difference_percentage
      ),
      billingPrice: getPrice(
        item.billing_price_formatted,
        item.price_difference_percentage
      ),
      billingPriceInclVat: getPrice(
        item.billing_amount_with_tax,
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

export const getTotals = (
  rows: ReconciliationRow[]
): { billingPriceTotal: string; billingPriceInclVatTotal: string } => {
  let billingPriceTotal = 0;
  let billingPriceInclVatTotal = 0;

  for (const row of rows) {
    billingPriceTotal += Number(row.billingPrice.replace(/[^0-9.-]+/g, "")); // Converts currency string to float (Returns 0 if "Invoice data missing")
    billingPriceInclVatTotal += Number(
      row.billingPriceInclVat.replace(/[^0-9.-]+/g, "")
    );
  }
  return {
    billingPriceTotal: billingPriceTotal.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    }),
    billingPriceInclVatTotal: billingPriceInclVatTotal.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    }),
  };
};

const PERCENTAGE_DISCREPANCY = [
  percentageDiscrepancySpecialCase.MN_NO_CHARGE,
  percentageDiscrepancySpecialCase.MN_INVOICE_MISSING,
  percentageDiscrepancySpecialCase.MN_EVENTS_MISSING,
  percentageDiscrepancySpecialCase.MN_RATES_MISSING,
  percentageDiscrepancySpecialCase.MN_UNEXPECTED_CHARGE,
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

const getStatus = (
  percentageDiscrepancy: string
): { message: string; class: string } => {
  const warning = PERCENTAGE_DISCREPANCY.find(
    (discrepancy) => discrepancy.magicNumber === percentageDiscrepancy
  );
  if (warning) return warning.statusLabel;
  if (+percentageDiscrepancy >= 1)
    return statusLabels.STATUS_LABEL_ABOVE_THRESHOLD;
  if (+percentageDiscrepancy <= -1)
    return statusLabels.STATUS_LABEL_BELOW_THRESHOLD;
  return statusLabels.STATUS_LABEL_WITHIN_THRESHOLD;
};

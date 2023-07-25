import { InvoiceStates, percentageDiscrepancySpecialCase } from "./constants";
import { FullExtractData } from "./extractTestDatajson";

export const formatPercentageDifference = (
  percentageDifference: number
): string => {
  const formattedPercentage = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 4,
  }).format(percentageDifference / 100);
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    return percentageDiscrepancySpecialCase[percentageDifference].bannerText;
  }
  if (percentageDifference >= -1 && percentageDifference <= 1) {
    return formattedPercentage;
  } else if (percentageDifference > 1) {
    return formattedPercentage;
  } else if (percentageDifference < -1) {
    return formattedPercentage;
  }
  throw new Error(`Invalid percentageDifference: ${percentageDifference}`);
};

export const formatInvoiceDataFromJson = (
  row: FullExtractData
): FullExtractData => {
  if (row.billing_quantity === "") {
    return {
      ...row,
      billing_quantity: InvoiceStates.invoiceDataMissing,
      billing_price_formatted: InvoiceStates.invoiceDataMissing,
      billing_amount_with_tax: InvoiceStates.invoiceDataMissing,
      billing_unit_price: InvoiceStates.invoiceDataMissing,
    };
  }
  if (row.transaction_quantity === "") {
    return {
      ...row,
      transaction_quantity: InvoiceStates.eventsMissing,
      transaction_price_formatted: InvoiceStates.eventsMissing,
    };
  }
  return row;
};

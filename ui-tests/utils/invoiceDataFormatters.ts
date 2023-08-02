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
    return percentageDiscrepancySpecialCase[percentageDifference].percentageDiscrepancy;
  }
  return formattedPercentage;
};

export const formatInvoiceDataFromJson = (
  row: FullExtractData
): FullExtractData => {
  const missingInvoiceState = {
    billing_quantity: InvoiceStates.invoiceDataMissing,
    billing_price_formatted: InvoiceStates.invoiceDataMissing,
    billing_amount_with_tax: InvoiceStates.invoiceDataMissing,
    billing_unit_price: InvoiceStates.invoiceDataMissing,
  };

  const missingTransactionState = {
    transaction_quantity: InvoiceStates.eventsMissing,
    transaction_price_formatted: InvoiceStates.eventsMissing,
  };
  if (row.billing_quantity === "") {
    return {
      ...row,
      ...missingInvoiceState,
    };
  }
  if (row.transaction_quantity === "") {
    return {
      ...row,
      ...missingTransactionState,
    };
  }

    if(row.transaction_price_formatted==="" && row.transaction_quantity!=="")
    {
      return {
        ...row,
        transaction_price_formatted:InvoiceStates.unableToFindRate
      }
    }
  
  return row;
};

import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getStandardisedDateText } from "./get-standardised-date-text";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getInvoiceReceiptDate = (fields: ExpenseField[]): string => {
  const rawDateText = getHighestConfidenceTextractValue(
    fields,
    "INVOICE_RECEIPT_DATE"
  );

  if (rawDateText === undefined)
    throw new Error("No invoice receipt date found");

  return getStandardisedDateText(rawDateText);
};

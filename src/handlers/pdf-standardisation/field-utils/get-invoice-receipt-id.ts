import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getInvoiceReceiptId = (fields: ExpenseField[]): string => {
  const receiptId = getHighestConfidenceTextractValue(
    fields,
    "INVOICE_RECEIPT_ID"
  );

  if (receiptId === undefined) throw new Error("No invoice receipt ID found.");

  return receiptId;
};

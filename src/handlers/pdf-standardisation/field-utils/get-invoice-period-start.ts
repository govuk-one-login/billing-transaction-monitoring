import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getStandardisedDateText } from "./get-standardised-date-text";

export const getInvoicePeriodStart = (
  fields: Textract.ExpenseField[]
): string => {
  const rawDateText = getHighestConfidenceTextractValue(
    fields,
    "INVOICE_PERIOD_START"
  );

  if (rawDateText === undefined)
    throw new Error("No invoice period start found");

  return getStandardisedDateText(rawDateText);
};

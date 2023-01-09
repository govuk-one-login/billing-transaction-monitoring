import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getStandardisedDateText } from "./get-standardised-date-text";

export const getDueDate = (
  fields: Textract.ExpenseField[]
): string | undefined => {
  const rawDateText = getHighestConfidenceTextractValue(fields, "DUE_DATE");

  return rawDateText === undefined
    ? undefined
    : getStandardisedDateText(rawDateText);
};

import { ExpenseField } from "@aws-sdk/client-textract";
import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getStandardisedDateText } from "./get-standardised-date-text";

export const getDueDate = (fields: ExpenseField[]): string | undefined => {
  const rawDateText = getHighestConfidenceTextractValue(fields, "DUE_DATE");

  if (rawDateText === undefined) return undefined;

  try {
    return getStandardisedDateText(rawDateText);
  } catch (error) {
    logger.warn("Ignored due date standardisation error", { error });
  }
};

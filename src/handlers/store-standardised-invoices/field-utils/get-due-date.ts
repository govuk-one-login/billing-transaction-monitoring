import { Textract } from "aws-sdk";
import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getStandardisedDateText } from "./get-standardised-date-text";

export const getDueDate = (
  fields: Textract.ExpenseField[]
): string | undefined => {
  const rawDateText = getHighestConfidenceTextractValue(fields, "DUE_DATE");

  if (rawDateText === undefined) return undefined;

  try {
    return getStandardisedDateText(rawDateText);
  } catch (error) {
    logger.warn("Ignored due date standardisation error", { error });
  }
};

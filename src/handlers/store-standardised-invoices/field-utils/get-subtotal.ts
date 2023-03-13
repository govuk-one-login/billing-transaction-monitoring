import { Textract } from "aws-sdk";
import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getSubtotal = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const subtotal = getHighestConfidenceTextractValue(fields, "SUBTOTAL");

  if (subtotal === undefined) return undefined;

  try {
    return getNumberFromMoneyText(subtotal);
  } catch (error) {
    logger.warn("Ignored subtotal standardisation error", { error });
  }
};

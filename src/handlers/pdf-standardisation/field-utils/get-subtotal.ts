import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getSubtotal = (fields: ExpenseField[]): number | undefined => {
  const subtotal = getHighestConfidenceTextractValue(fields, "SUBTOTAL");

  if (subtotal === undefined) return undefined;

  try {
    return getNumberFromMoneyText(subtotal);
  } catch (error) {
    logger.warn("Ignored subtotal standardisation error", { error });
  }
};

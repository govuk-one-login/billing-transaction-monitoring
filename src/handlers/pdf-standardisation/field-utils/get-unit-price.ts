import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getUnitPrice = (fields: ExpenseField[]): number | undefined => {
  const unitPrice = getHighestConfidenceTextractValue(fields, "UNIT_PRICE");

  if (unitPrice === undefined) return undefined;

  try {
    return getNumberFromMoneyText(unitPrice);
  } catch (error) {
    logger.warn("Ignored unit price standardisation error", { error });
  }
};

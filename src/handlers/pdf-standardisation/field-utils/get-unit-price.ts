import { Textract } from "aws-sdk";
import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getUnitPrice = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const unitPrice = getHighestConfidenceTextractValue(fields, "UNIT_PRICE");

  if (unitPrice === undefined) return undefined;

  try {
    return getNumberFromMoneyText(unitPrice);
  } catch (error) {
    logger.warn("Ignored unit price standardisation error", { error });
  }
};

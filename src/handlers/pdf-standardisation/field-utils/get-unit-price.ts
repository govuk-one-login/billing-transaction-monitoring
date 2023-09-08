import { Textract } from "aws-sdk";
import { getNumberFromMoneyText, logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

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

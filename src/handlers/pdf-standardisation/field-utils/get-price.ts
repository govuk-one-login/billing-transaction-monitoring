import { Textract } from "aws-sdk";
import { getNumberFromMoneyText, logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getPrice = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const price = getHighestConfidenceTextractValue(fields, "PRICE");

  if (price === undefined) return undefined;

  try {
    return getNumberFromMoneyText(price);
  } catch (error) {
    logger.warn("Ignored price standardisation error", { error });
  }
};

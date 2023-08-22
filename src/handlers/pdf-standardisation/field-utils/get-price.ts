import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getPrice = (fields: ExpenseField[]): number | undefined => {
  const price = getHighestConfidenceTextractValue(fields, "PRICE");

  if (price === undefined) return undefined;

  try {
    return getNumberFromMoneyText(price);
  } catch (error) {
    logger.warn("Ignored price standardisation error", { error });
  }
};

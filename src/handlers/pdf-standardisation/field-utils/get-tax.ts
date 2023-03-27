import { Textract } from "aws-sdk";
import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getTax = (fields: Textract.ExpenseField[]): number | undefined => {
  const taxText = getHighestConfidenceTextractValue(fields, "TAX");

  if (taxText === undefined) return undefined;

  try {
    return getNumberFromMoneyText(taxText);
  } catch (error) {
    logger.warn("Ignored tax standardisation error", { error });
  }
};

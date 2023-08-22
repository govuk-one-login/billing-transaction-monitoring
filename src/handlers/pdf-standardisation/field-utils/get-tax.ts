import { logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getTax = (fields: ExpenseField[]): number | undefined => {
  const taxText = getHighestConfidenceTextractValue(fields, "TAX");

  if (taxText === undefined) return undefined;

  try {
    return getNumberFromMoneyText(taxText);
  } catch (error) {
    logger.warn("Ignored tax standardisation error", { error });
  }
};

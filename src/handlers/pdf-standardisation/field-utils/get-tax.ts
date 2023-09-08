import { Textract } from "aws-sdk";
import { getNumberFromMoneyText, logger } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getTax = (fields: Textract.ExpenseField[]): number | undefined => {
  const taxText = getHighestConfidenceTextractValue(fields, "TAX");

  if (taxText === undefined) return undefined;

  try {
    return getNumberFromMoneyText(taxText);
  } catch (error) {
    logger.warn("Ignored tax standardisation error", { error });
  }
};

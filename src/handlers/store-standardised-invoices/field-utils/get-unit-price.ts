import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getUnitPrice = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const unitPrice = getHighestConfidenceTextractValue(fields, "UNIT_PRICE");

  return unitPrice === undefined
    ? undefined
    : getNumberFromMoneyText(unitPrice);
};

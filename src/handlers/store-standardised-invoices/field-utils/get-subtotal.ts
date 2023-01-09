import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getSubtotal = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const subtotal = getHighestConfidenceTextractValue(fields, "SUBTOTAL");
  return subtotal === undefined ? undefined : getNumberFromMoneyText(subtotal);
};

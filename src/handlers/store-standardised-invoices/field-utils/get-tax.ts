import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getTax = (fields: Textract.ExpenseField[]): number | undefined => {
  const taxText = getHighestConfidenceTextractValue(fields, "TAX");
  return taxText === undefined ? undefined : getNumberFromMoneyText(taxText);
};

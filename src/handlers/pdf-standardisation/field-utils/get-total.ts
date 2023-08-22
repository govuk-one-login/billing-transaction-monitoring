import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getTotal = (fields: ExpenseField[]): number => {
  const totalText = getHighestConfidenceTextractValue(fields, "TOTAL");
  if (totalText === undefined) throw new Error("No total found.");
  return getNumberFromMoneyText(totalText);
};

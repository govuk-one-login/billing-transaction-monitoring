import { Textract } from "aws-sdk";
import { getNumberFromMoneyText } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getTotal = (fields: Textract.ExpenseField[]): number => {
  const totalText = getHighestConfidenceTextractValue(fields, "TOTAL");
  if (totalText === undefined) throw new Error("No total found.");
  return getNumberFromMoneyText(totalText);
};

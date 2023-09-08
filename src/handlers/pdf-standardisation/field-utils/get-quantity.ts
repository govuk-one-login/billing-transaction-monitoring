import { Textract } from "aws-sdk";
import { getNumberFromWholeQuantityText } from "../../../shared/utils";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getQuantity = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const quantity = getHighestConfidenceTextractValue(fields, "QUANTITY");

  return quantity === undefined
    ? undefined
    : getNumberFromWholeQuantityText(quantity);
};

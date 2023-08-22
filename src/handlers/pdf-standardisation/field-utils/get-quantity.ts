import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { ExpenseField } from "@aws-sdk/client-textract";

export const getQuantity = (fields: ExpenseField[]): number | undefined => {
  const quantity = getHighestConfidenceTextractValue(fields, "QUANTITY")
    ?.replace(/[.,]00?$/g, "")
    .replace(/[.,]/g, "");

  return quantity === undefined ? undefined : Number(quantity);
};

import { ExpenseField } from "@aws-sdk/client-textract";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getItemDescription = (
  fields: ExpenseField[]
): string | undefined => getHighestConfidenceTextractValue(fields, "ITEM");

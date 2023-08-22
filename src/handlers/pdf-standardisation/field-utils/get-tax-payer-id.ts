import { ExpenseField } from "@aws-sdk/client-textract";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getTaxPayerId = (fields: ExpenseField[]): string | undefined =>
  getHighestConfidenceTextractValue(fields, "TAX_PAYER_ID");

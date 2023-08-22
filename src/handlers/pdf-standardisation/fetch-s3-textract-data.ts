import { fetchS3 } from "../../shared/utils";
import {
  ExpenseDocument,
  ExpenseField,
  ExpenseType,
  LineItemFields,
  LineItemGroup,
} from "@aws-sdk/client-textract";

export const fetchS3TextractData = async (
  bucket: string,
  key: string
): Promise<ExpenseDocument[]> => {
  const text = await fetchS3(bucket, key);

  let documents;
  try {
    documents = JSON.parse(text);
  } catch {
    throw new Error("Textract data not valid JSON.");
  }

  if (!Array.isArray(documents)) throw new Error("Textract data not array.");

  for (const document of documents) validateDocument(document);

  return documents;
};

const isExpenseField = (x: any): x is ExpenseField =>
  typeof x === "object" &&
  (x.Type === undefined || isExpenseType(x.Type)) &&
  (x.ValueDetection === undefined || isExpenseType(x.ValueDetection)); // `isExpenseType` works for ExpenseDetection here, because it is the same as ExpenseType except for the Geometry field, but we do not use that

const isExpenseType = (x: any): x is ExpenseType =>
  typeof x === "object" &&
  (x.Text === undefined || typeof x.Text === "string") &&
  (x.Confidence === undefined || typeof x.Confidence === "number");

const isLineItem = (x: any): x is LineItemFields =>
  x.LineItemExpenseFields === undefined ||
  (Array.isArray(x.LineItemExpenseFields) &&
    x.LineItemExpenseFields.every(isExpenseField));

const isLineItemGroup = (x: any): x is LineItemGroup =>
  x.LineItems === undefined ||
  (Array.isArray(x.LineItems) && x.LineItems.every(isLineItem));

const validateDocument = (document: any): void => {
  if (typeof document !== "object")
    throw new Error("Textract data not array of objects.");

  const { LineItemGroups: lineItemGroups, SummaryFields: summaryFields } =
    document;

  if (lineItemGroups !== undefined) validateLineItemGroups(lineItemGroups);

  if (summaryFields !== undefined) validateSummaryFields(summaryFields);
};

const validateLineItemGroups = (lineItemGroups: any): void => {
  if (!Array.isArray(lineItemGroups))
    throw new Error("Textract line item groups property not array.");

  if (!lineItemGroups.every(isLineItemGroup))
    throw new Error("Invalid Textract line item group.");
};

const validateSummaryFields = (summaryFields: any): void => {
  if (!Array.isArray(summaryFields))
    throw new Error("Textract summary fields property not array.");

  if (!summaryFields.every(isExpenseField))
    throw new Error("Invalid Textract summary field.");
};

import { Textract } from "aws-sdk";

export const getHighestConfidenceTextractValue = (
  fields: Textract.ExpenseField[],
  fieldType: string
): string | undefined => {
  const candidateFields = fields.filter(
    (field) =>
      field.Type?.Text === fieldType &&
      field.Type?.Confidence !== undefined &&
      field.ValueDetection?.Confidence !== undefined &&
      field.ValueDetection?.Text !== undefined
  );

  if (candidateFields.length === 0) return;

  // Sort confidence highest to lowest
  candidateFields.sort((field1, field2) => {
    const confidence1 = getConfidence(field1);
    const confidence2 = getConfidence(field2);

    return confidence1 > confidence2 ? -1 : confidence1 < confidence2 ? 1 : 0;
  });

  const highestConfidenceField = candidateFields[0];
  return highestConfidenceField.ValueDetection?.Text;
};

const getConfidence = (field: Textract.ExpenseField): number => {
  const typeConfidence = field.Type?.Confidence as number;
  const valueConfidence = field.ValueDetection?.Confidence as number;
  return typeConfidence * valueConfidence;
};

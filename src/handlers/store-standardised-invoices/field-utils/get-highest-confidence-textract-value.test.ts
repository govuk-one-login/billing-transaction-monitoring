import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

const mockField = (
  type?: string,
  value?: string,
  confidence?: number
): Textract.ExpenseField => ({
  Type: {
    Text: type,
    Confidence:
      confidence === undefined ? undefined : Math.sqrt(confidence / 100) * 100,
  },
  ValueDetection: {
    Text: value,
    Confidence:
      confidence === undefined ? undefined : Math.sqrt(confidence / 100) * 100,
  },
});

describe("Highest confidence Textract value getter", () => {
  let givenFields: Textract.ExpenseField[];
  let givenType: string;

  beforeEach(() => {
    givenFields = [];
    givenType = "given type";
  });

  test("Highest confidence Textract value getter with no fields", () => {
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with empty fields", () => {
    givenFields = [{}, {}];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field without type", () => {
    givenFields = [mockField(undefined, "given value", 100)];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field without value", () => {
    givenFields = [mockField(givenType, undefined, 100)];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field without confidence", () => {
    givenFields = [mockField(givenType, "given value", undefined)];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field no matching field", () => {
    givenFields = [mockField("not given type", "given value", 100)];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with one matching field", () => {
    givenFields = [mockField(givenType, "given value", 100)];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBe("given value");
  });

  test("Highest confidence Textract value getter multiple matching fields", () => {
    givenFields = [
      mockField(givenType, "given lower confidence value 1", 98),
      mockField(givenType, "given lower confidence value 2", 0),
      mockField(givenType, "given highest confidence value", 99),
      mockField(givenType, "given lower confidence value 3", 98),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBe("given highest confidence value");
  });
});

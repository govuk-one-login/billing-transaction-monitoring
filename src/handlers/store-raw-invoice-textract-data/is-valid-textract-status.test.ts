import { VALID_TEXTRACT_STATUS_MESSAGES } from "../../shared/constants";
import { isValidTextractStatus } from "./is-valid-textract-status";

describe("Valid Textract status type guard", () => {
  test("Valid Textract status type guard with invalid status", () => {
    const givenStatus = "some invalid status";
    const result = isValidTextractStatus(givenStatus);
    expect(result).toBe(false);
  });

  test("Valid Textract status type guard with invalid status", () => {
    const givenStatus = [...VALID_TEXTRACT_STATUS_MESSAGES][0];
    const result = isValidTextractStatus(givenStatus);
    expect(result).toBe(true);
  });
});

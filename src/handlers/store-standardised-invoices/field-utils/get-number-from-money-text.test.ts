import { getNumberFromMoneyText } from "./get-number-from-money-text";

describe("Number from money text getter", () => {
  test.each`
    givenText                      | expectedResult
    ${"0.00"}                      | ${0}
    ${"10000.00"}                  | ${10_000}
    ${"10,000.00"}                 | ${10_000}
    ${"£0.00"}                     | ${0}
    ${"£1.2345"}                   | ${1.2345}
    ${"£10000.00"}                 | ${10_000}
    ${"£10,000.00"}                | ${10_000}
    ${"£12,345.678 per Record(s)"} | ${12_345.678}
    ${"£ 0.00"}                    | ${0}
    ${"£ 10000.00"}                | ${10_000}
    ${"£ 10,000.00"}               | ${10_000}
  `(
    "Number from money text getter with $givenText",
    ({ expectedResult, givenText }) => {
      const result = getNumberFromMoneyText(givenText);
      expect(result).toBe(expectedResult);
    }
  );

  test("Number from money text getter with invalid money text", () => {
    const givenText = "given invalid text";
    expect(() => getNumberFromMoneyText(givenText)).toThrowError("format");
  });
});

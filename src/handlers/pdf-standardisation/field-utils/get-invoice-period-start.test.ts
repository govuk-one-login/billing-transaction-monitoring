import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getInvoicePeriodStart } from "./get-invoice-period-start";
import { getStandardisedDateText } from "./get-standardised-date-text";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-standardised-date-text");
const mockedGetStandardisedDateText = getStandardisedDateText as jest.Mock;

describe("Invoice period start getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Invoice period start getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    expect(() => getInvoicePeriodStart(givenFields)).toThrowError(
      "invoice period start"
    );
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "INVOICE_PERIOD_START"
    );
    expect(mockedGetStandardisedDateText).not.toHaveBeenCalled();
  });

  test("Invoice period start getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedDateText = "mocked date text";
    mockedGetStandardisedDateText.mockReturnValue(mockedDateText);

    const givenFields = "given fields" as any;

    const result = getInvoicePeriodStart(givenFields);

    expect(result).toBe(mockedDateText);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "INVOICE_PERIOD_START"
    );
    expect(mockedGetStandardisedDateText).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedDateText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});

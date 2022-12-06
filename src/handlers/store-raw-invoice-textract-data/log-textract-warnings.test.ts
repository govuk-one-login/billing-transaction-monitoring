import { logTextractWarnings } from "./log-textract-warnings";

describe("Textract warnings logger", () => {
  const oldConsoleWarn = console.warn;
  let mockedConsoleWarn: jest.Mock;

  beforeEach(() => {
    mockedConsoleWarn = jest.fn();
    console.warn = mockedConsoleWarn;
  });

  afterEach(() => {
    console.warn = oldConsoleWarn;
  });

  test("Textract warnings logger with empty array", () => {
    const givenWarnings: any = [];
    logTextractWarnings(givenWarnings);
    expect(mockedConsoleWarn).not.toHaveBeenCalled();
  });

  test("Textract warnings logger with single warning with no code or pages", () => {
    const givenWarning = {};
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mockedConsoleWarn).toHaveBeenCalledWith("Warning");
  });

  test("Textract warnings logger with single warning with code and no pages", () => {
    const givenCode = "given code";
    const givenWarning = { ErrorCode: givenCode };
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mockedConsoleWarn).toHaveBeenCalledWith(`Warning code ${givenCode}`);
  });

  test("Textract warnings logger with single warning with pages and no code", () => {
    const givenPages = [1, 2, 3];
    const givenWarning = { Pages: givenPages };
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mockedConsoleWarn).toHaveBeenCalledWith("Warning for pages 1, 2, 3");
  });

  test("Textract warnings logger with single warning with code and pages", () => {
    const givenCode = "given code";
    const givenPages = [1, 2, 3];
    const givenWarning = {
      ErrorCode: givenCode,
      Pages: givenPages,
    };
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mockedConsoleWarn).toHaveBeenCalledWith(
      `Warning code ${givenCode} for pages 1, 2, 3`
    );
  });

  test("Textract warnings logger with multiple warnings", () => {
    const givenWarning = {};
    const givenWarnings = [givenWarning, givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedConsoleWarn).toHaveBeenCalledTimes(2);
  });
});

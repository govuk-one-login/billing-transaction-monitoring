import { logger } from "../../shared/utils";
import { logTextractWarnings } from "./log-textract-warnings";

jest.mock("../../shared/utils");
const mockedLogger = logger as jest.MockedObject<typeof logger>;

describe("Textract warnings logger", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Textract warnings logger with empty array", () => {
    const givenWarnings: any = [];
    logTextractWarnings(givenWarnings);
    expect(mockedLogger.warn).not.toHaveBeenCalled();
  });

  test("Textract warnings logger with single warning with no code or pages", () => {
    const givenWarning = {};
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith("Warning");
  });

  test("Textract warnings logger with single warning with code and no pages", () => {
    const givenCode = "given code";
    const givenWarning = { ErrorCode: givenCode };
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(`Warning code ${givenCode}`);
  });

  test("Textract warnings logger with single warning with pages and no code", () => {
    const givenPages = [1, 2, 3];
    const givenWarning = { Pages: givenPages };
    const givenWarnings = [givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith("Warning for pages 1, 2, 3");
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

    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      `Warning code ${givenCode} for pages 1, 2, 3`
    );
  });

  test("Textract warnings logger with multiple warnings", () => {
    const givenWarning = {};
    const givenWarnings = [givenWarning, givenWarning];

    logTextractWarnings(givenWarnings);

    expect(mockedLogger.warn).toHaveBeenCalledTimes(2);
  });
});

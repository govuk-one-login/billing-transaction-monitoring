import { getFromEnv } from "./env";

describe("Environment Variable Getter", () => {
  let mockedDefinedVariableName: string;
  let mockedDefinedVariableValue: string;
  let mockedUndefinedVariableName: string;
  let oldEnv: any;

  beforeEach(() => {
    oldEnv = process.env;

    mockedDefinedVariableName = "MOCKED_DEFINED_VARIABLE_NAME";
    mockedDefinedVariableValue = "mocked defined variable value";
    mockedUndefinedVariableName = "MOCKED_UNDEFINED_VARIABLE_NAME";

    process.env = {
      ...oldEnv,
      [mockedDefinedVariableName]: mockedDefinedVariableValue,
      [mockedUndefinedVariableName]: undefined,
    };
  });

  afterEach(() => {
    process.env = oldEnv;
  });

  test("Environment Variable Getter with defined variable", () => {
    const givenVariableName = mockedDefinedVariableName;
    const result = getFromEnv(givenVariableName);
    expect(result).toBe(mockedDefinedVariableValue);
  });

  test("Environment Variable Getter with defined variable", () => {
    const givenVariableName = mockedUndefinedVariableName;
    const result = getFromEnv(givenVariableName);
    expect(result).toBe(undefined);
  });
});

import { EnvVarName, getFromEnv } from "./env";

describe("Environment Variable Getter", () => {
  let mockedDefinedVarName: EnvVarName;
  let mockedDefinedVarValue: string;
  let mockedUndefinedVarName: EnvVarName;
  let oldEnv: any;

  beforeEach(() => {
    oldEnv = process.env;

    mockedDefinedVarName = "MOCKED_DEFINED_VARIABLE_NAME" as any;
    mockedDefinedVarValue = "mocked defined variable value";
    mockedUndefinedVarName = "MOCKED_UNDEFINED_VARIABLE_NAME" as any;

    process.env = {
      ...oldEnv,
      [mockedDefinedVarName]: mockedDefinedVarValue,
      [mockedUndefinedVarName]: undefined,
    };
  });

  afterEach(() => {
    process.env = oldEnv;
  });

  test("Environment Variable Getter with defined variable", () => {
    const givenVarName = mockedDefinedVarName;
    const result = getFromEnv(givenVarName);
    expect(result).toBe(mockedDefinedVarValue);
  });

  test("Environment Variable Getter with undefined variable", () => {
    const givenVarName = mockedUndefinedVarName;
    const result = getFromEnv(givenVarName);
    expect(result).toBe(undefined);
  });
});

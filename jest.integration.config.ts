import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testRegex: "tests\\.ts",
  coveragePathIgnorePatterns: ["/node_modules/"],
  preset: "ts-jest",
  verbose: true,
  testTimeout: 30000,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        outputName: "testReport.xml",
      },
    ],
  ]
};

export default config;

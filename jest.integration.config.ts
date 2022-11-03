import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testRegex: "tests\\.ts",
  coveragePathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["jest-allure/dist/setup"],
  preset: "ts-jest",
  testRunner: "jasmine2",
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

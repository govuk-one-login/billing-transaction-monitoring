import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ["<rootDir>/integration_tests"],
  testMatch: ["**/tests/*tests.ts"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  preset: "ts-jest",
  testRunner: "jasmine2",
  globalSetup: "./src/handlers/int-test-support/helpers/testSetup.ts",
  verbose: true,
  testTimeout: 200000,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        outputName: "testReport.xml",
      },
    ],
  ],
};

export default config;

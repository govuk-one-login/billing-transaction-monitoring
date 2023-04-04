import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ["<rootDir>/integration_tests"],
  testMatch: ["**/tests/*tests.ts"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  preset: "ts-jest",
  testRunner: "jasmine2",
  globalSetup: "./src/handlers/int-test-support/helpers/testSetup.ts",
  verbose: true,
  testTimeout: 1600000,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        outputName: "testReport.xml",
      },
    ],
    [
      "jest-html-reporters",
      {
        publicPath: "./reports/jest-html-reporters-attach",
        filename: "index_" + Date.now().toString() + ".html",
        expand: true,
        openReport: true,
        pageTitle: "BTM INTEGRATION TEST REPORT",
        automateJson: true,
        includeFailureMsg: true,
        history: 5,
      },
    ],
  ],
};

export default config;

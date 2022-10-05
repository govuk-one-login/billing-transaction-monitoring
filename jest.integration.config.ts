import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testRegex: "tests\\.ts",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: ["/src/"],
  preset: "ts-jest",
  verbose: true,
  testTimeout: 30000,
};

export default config;

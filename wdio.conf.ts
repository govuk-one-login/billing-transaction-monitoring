import { uploadExtractDataFileForUITest } from "./ui-tests/testData/test.setup";

const determineBaseUrl = (): string => {
  switch (process.env.ENV_NAME) {
    case "dev":
      return "https://btm.dev.account.gov.uk/";
    case "build":
      return "https://btm.build.account.gov.uk/";
    case "staging":
      return "https://btm.staging.account.gov.uk/";
    default:
      return "http://localhost:3000";
  }
};
const baseUrl = determineBaseUrl();

const browserName: string = process.env.BROWSER ?? "chrome";
const maxInstances: number = browserName === "safari" ? 1 : 10;

export const config = {
  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "./tsconfig.json",
    },
  },
  specs: ["./ui-tests/specs/**/*.spec.ts"],
  maxInstances,
  capabilities: [
    {
      browserName,
      [`${
        browserName === "MicrosoftEdge"
          ? "ms:edgeOptions"
          : browserName === "firefox"
          ? "moz:firefoxOptions"
          : browserName === "safari"
          ? "safari:options"
          : "goog:chromeOptions"
      }`]: {
        args: browserName === "safari" ? [] : ["--headless"],
      },
    },
  ],
  logLevel: "error",
  bail: 0,
  baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["chromedriver", "geckodriver", "safaridriver", "edgedriver"],
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  beforeTest: async function () {
    await uploadExtractDataFileForUITest();
  },
};

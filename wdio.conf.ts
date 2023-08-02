import { cleanAndUploadExtractFileForUITest } from "./ui-tests/testData/test.setup";

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

export const config = {
  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "./tsconfig.json",
    },
  },
  specs: ["./ui-tests/specs/invoice.spec.ts"],
  maxInstances: 10,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: ["--headless", "--disable-gpu"],
      },
    },
  ],
  logLevel: "error",
  bail: 0,
  baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["chromedriver"],
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  onPrepare: async function () {
    await cleanAndUploadExtractFileForUITest();
  },
};

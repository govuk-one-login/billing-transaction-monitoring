import { uploadExtractDataFileForUITest } from "./ui-tests/testData/test.setup";

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
        args: browserName === "safari" ? [] : [],
      },
    },
  ],
  logLevel: "error",
  bail: 0,
  baseUrl: "",
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

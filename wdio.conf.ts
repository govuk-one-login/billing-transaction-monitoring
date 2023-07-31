import { uploadExtractDataFileForUITest } from "./ui-tests/testData/test.setup";

const BASE_URLS = {
  local: "http://localhost:3000",
  dev: "https://btm.dev.account.gov.uk/",
  build: "https://btm.build.account.gov.uk/",
  staging: "https://btm.staging.account.gov.uk/",
};

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
  baseUrl:
    BASE_URLS[process.env.ENV as keyof typeof BASE_URLS] ?? BASE_URLS.dev,
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
  beforeTest: async function () {
    await uploadExtractDataFileForUITest();
  },
};

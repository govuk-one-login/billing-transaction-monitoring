import { uploadExtractDataFileForUITest } from "./ui-tests/testData/test.setup";
import { ReportAggregator } from "wdio-html-nice-reporter";
let reportAggregator: ReportAggregator;

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
  baseUrl: "http://localhost:3000",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["chromedriver"],
  framework: "mocha",
  reporters: [
    "spec",
    [
      "html-nice",
      {
        outputDir: "./ui-tests/reports",
      },
    ],
  ],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  beforeTest: async function (): Promise<void> {
    await uploadExtractDataFileForUITest();
  },

  onPrepare: async function (capabilities: { browser: any }): Promise<void> {
    reportAggregator = new ReportAggregator({
      outputDir: "./ui-tests/reports/",
      filename: "ui-test-report.html",
      reportTitle: "Billing and Transaction Monitoring UI Tests",
      browserName: capabilities.browser,
      collapseTests: false,
      showInBrowser: true,
    });
    reportAggregator.clean();
  },

  onComplete: async function (): Promise<void> {
    await reportAggregator.createReport();
  },
};

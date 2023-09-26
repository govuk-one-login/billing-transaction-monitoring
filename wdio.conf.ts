import { cleanAndUploadExtractFileForUITest } from "./ui-tests/testData/test.setup";
import { ReportAggregator, HtmlReporter } from "wdio-html-nice-reporter";

let reportAggregator: ReportAggregator;

const localUrl = "http://localhost:3000";

const determineBaseUrl = (): string => {
  switch (process.env.ENV_NAME) {
    case "dev":
      return "https://btm.dev.account.gov.uk/";
    case "build":
      return "https://btm.build.account.gov.uk/";
    case "staging":
      return "https://btm.staging.account.gov.uk/";
    default:
      return `https://${process.env.ENV_NAME}.btm.dev.account.gov.uk`;
  }
};
const baseUrl = determineBaseUrl();

const browserName: string = process.env.BROWSER ?? "chrome";
const maxInstances: number = browserName === "safari" ? 1 : 10;

const getBrowserOptions = (browserName: string): string => {
  if (browserName === "MicrosoftEdge") return "ms:edgeOptions";
  if (browserName === "firefox") return "moz:firefoxOptions";
  if (browserName === "safari") return "safari:options";
  return "goog:chromeOptions";
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
  specs: ["./ui-tests/specs/breadcrumbs.spec.ts"],
  exclude: baseUrl === localUrl ? ["./ui-tests/specs/waf.spec.ts"] : [],
  maxInstances,
  capabilities: [
    {
      browserName,
      // To run tests without headless mode set the args to an empty array [].This is applicable for all browsers expect safari.
      [getBrowserOptions(browserName)]: {
        args:
          browserName === "safari"
            ? []
            : [
                "--headless",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-sandbox",
              ],
      },
    },
  ],
  logLevel: "error",
  bail: 0,
  baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    browserName === "firefox"
      ? "geckodriver"
      : browserName === "safari"
      ? "safaridriver"
      : browserName === "MicrosoftEdge"
      ? "edgedriver"
      : "chromedriver",
  ],
  framework: "mocha",
  reporters: [
    "spec",
    [
      "junit",
      {
        outputDir: "./ui-tests/reports/junitReports",
        outputFileFormat: function () {
          return "uiTestReport.xml";
        },
      },
    ],
    [
      HtmlReporter,
      {
        outputDir: `./ui-tests/reports/uiHtmlReports/`,
      },
    ],
  ],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  onPrepare: async function (): Promise<void> {
    await cleanAndUploadExtractFileForUITest();
    reportAggregator = new ReportAggregator({
      outputDir: "./ui-tests/reports/uiHtmlReports/",
      filename: `test-report-ui-${new Date().toISOString()}.html`,
      reportTitle: `Billing and Transaction Monitoring UI Tests (BaseURL:${baseUrl}) `,
      browserName,
      showInBrowser: true,
      produceJson: false,
    });
    reportAggregator.clean();
  },
  onComplete: async function (): Promise<void> {
    await reportAggregator.createReport();
  },
};

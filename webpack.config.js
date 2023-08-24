import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  devtool: "source-map",
  entry: {
    filter: "./src/handlers/filter/handler.ts",
    clean: "./src/handlers/clean/handler.ts",
    storeTransactions: "./src/handlers/store-transactions/handler.ts",
    transactionCsvToJsonEvent:
      "./src/handlers/transaction-csv-to-json-event/handler.ts",
    customAthenaViewResource:
      "./src/handlers/custom-athena-view-resource/handler.ts",
    intTestSupport: "./src/handlers/int-test-support/handler.ts",
    processEmail: "./src/handlers/process-email/handler.ts",
    pdfExtract: "./src/handlers/pdf-extract/handler.ts",
    storeRawInvoiceTextractData:
      "./src/handlers/store-raw-invoice-textract-data/handler.ts",
    pdfStandardisation: "./src/handlers/pdf-standardisation/handler.ts",
    csvExtract: "./src/handlers/csv-extract/handler.ts",
    dashboardExtract: "./src/handlers/dashboard-extract/handler.ts",
    storeStandardisedInvoices:
      "./src/handlers/store-standardised-invoices/handler.ts",
    frontend: "./src/handlers/frontend/handler.ts",
    server: "./src/frontend/server.ts",
    frontendAuth: "./src/handlers/frontend-auth/handler.ts",
    syntheticEvents: "./src/handlers/synthetic-events/handler.ts",
  },
  externals: "aws-sdk",
  mode: process.env.NODE_ENV === "dev" ? "development" : "production",
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
      { test: /.node$/, loader: "node-loader" },
    ],
  },
  output: {
    clean: true,
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "./dist"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/govuk-frontend/govuk/components",
          to: "./govuk/components",
        },
        {
          from: "./node_modules/govuk-frontend/govuk/template.njk",
          to: "./govuk",
        },
        {
          from: "./src/frontend/styles/all.css",
          to: "./assets/styles",
        },
        {
          from: "./node_modules/govuk-frontend/govuk/all.js",
          to: "./assets/scripts",
        },
        {
          from: "./node_modules/govuk-frontend/govuk/assets",
          to: "./assets/",
        },
        {
          from: "./src/frontend/views",
          to: "views",
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".ts"],
  },
  target: "node",
};

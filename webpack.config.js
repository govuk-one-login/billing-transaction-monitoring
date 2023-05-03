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
    pdfExtract: "./src/handlers/pdf-extract/handler.ts",
    storeRawInvoiceTextractData:
      "./src/handlers/store-raw-invoice-textract-data/handler.ts",
    pdfStandardisation: "./src/handlers/pdf-standardisation/handler.ts",
    csvExtract: "./src/handlers/csv-extract/handler.ts",
    storeStandardisedInvoices:
      "./src/handlers/store-standardised-invoices/handler.ts",
    frontend: "./src/handlers/frontend/handler.ts",
  },
  externals: "aws-sdk",
  mode: process.env.NODE_ENV === "dev" ? "development" : "production",
  module: {
    rules: [
      { test: /.node$/, loader: "node-loader" },
      { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
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
          from: "./node_modules/govuk-frontend",
          to: "node_modules/govuk-frontend",
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

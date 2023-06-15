import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

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
  },
  externals: "aws-sdk",
  mode: process.env.NODE_ENV === "dev" ? "development" : "production",
  module: {
    rules: [
      { test: /.node$/, loader: "node-loader" },
      { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates css files from commonJS
          MiniCssExtractPlugin.loader,
          // Creates commonJS form CSS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  output: {
    clean: true,
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.resolve(import.meta.url, "./dist"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
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
    new MiniCssExtractPlugin({
      filename: "./assets/styles/app.css",
    }),
  ],
  resolve: {
    extensions: [".js", ".ts"],
  },
  target: "node",
};

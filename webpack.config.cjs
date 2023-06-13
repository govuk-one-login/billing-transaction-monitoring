const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "source-map",
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
    watchFiles: [
      "./src/frontend/**/*",
      "./src/frontend/app.ts",
      "src/frontend/app.ts",
    ],
  },
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
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          sourceMap: true,
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // // Creates `style` nodes from JS strings
          // "style-loader",

          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          "css-loader",

          // Compiles Sass to CSS
          "sass-loader",
          //
          // // Hack to attempt to load app.scss
          // path.resolve(__dirname, "./src/loader"),
        ],
      },
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
    new MiniCssExtractPlugin({
      filename: "./assets/styles/app.css",
    }),
  ],
  resolve: {
    extensions: [".js", ".ts"],
  },
  target: "node",
};

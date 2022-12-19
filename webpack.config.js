import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    clean: "./src/handlers/clean/handler.ts",
    customAthenaViewResource:
      "./src/handlers/custom-athena-view-resource/handler.ts",
    customS3ObjectResource:
      "./src/handlers/custom-s3-object-resource/handler.ts",
    extract: "./src/handlers/extract/handler.ts",
    filter: "./src/handlers/filter/handler.ts",
    storeRawInvoiceTextractData:
      "./src/handlers/store-raw-invoice-textract-data/handler.ts",
    storeTransactions: "./src/handlers/store-transactions/handler.ts",
    storeStandardisedInvoices:
      "./src/handlers/store-standardised-invoices/handler.ts",
  },
  externals: "aws-sdk",
  mode: process.env.NODE_ENV === "dev" ? "development" : "production",
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  output: {
    clean: true,
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "./dist"),
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  target: "node",
};

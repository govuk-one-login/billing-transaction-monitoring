import express, { Express } from "express";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { contractsHandler } from "./handlers/contracts";
import { getInvoiceHandler } from "./handlers/invoice";
import { getInvoicesHandler } from "./handlers/invoices";

let dirname: string;
try {
  dirname = __dirname;
} catch {
  const filePath = fileURLToPath(import.meta.url);
  dirname = path.dirname(filePath);
}

const shouldLoadFromNodeModules =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export const initApp = (app: Express): void => {
  const viewDir = path.join(dirname, "views");
  const macrosDir = path.join(dirname, "macros");

  const templatePath = shouldLoadFromNodeModules
    ? "node_modules/govuk-frontend"
    : dirname;

  nunjucks.configure([templatePath, viewDir, macrosDir], {
    autoescape: true,
    express: app,
  });

  app.engine("njk", nunjucks.render);

  app.get("/", (_, response) => {
    response.render("index.njk");
  });

  app.get("/contracts", contractsHandler);

  app.get("/invoices", getInvoicesHandler);

  app.get("/invoice", getInvoiceHandler);

  const assetsPath = shouldLoadFromNodeModules
    ? path.join("node_modules/govuk-frontend/govuk", "./assets")
    : path.join(dirname, "./assets");

  const scriptsPath = shouldLoadFromNodeModules
    ? "node_modules/govuk-frontend/govuk"
    : assetsPath;

  const stylesPath = shouldLoadFromNodeModules
    ? "node_modules/govuk-frontend/govuk"
    : assetsPath;

  app.use("/assets", express.static(assetsPath));
  app.use("/assets/scripts", express.static(scriptsPath));
  app.use("/assets/styles", express.static(stylesPath));
};

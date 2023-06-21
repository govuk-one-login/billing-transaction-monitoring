import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { contractsHandler } from "./handlers/contracts";
import { getInvoicesHandler } from "./handlers/invoices";

let dirname;
try {
  dirname = __dirname;
} catch {
  const filePath = fileURLToPath(import.meta.url);
  dirname = path.dirname(filePath);
}

const app = express();

const viewDir = path.join(dirname, "views");

const templatePath =
  process.env.NODE_ENV === "development"
    ? "node_modules/govuk-frontend"
    : dirname;

nunjucks.configure([templatePath, viewDir], {
  autoescape: true,
  express: app,
});

app.engine("njk", nunjucks.render);

app.get("/", (_, response) => {
  response.render("index.njk");
});

app.get("/contracts", contractsHandler);

app.get("/invoices", getInvoicesHandler);

app.get("/invoice", (_, response) => {
  response.render("invoice.njk");
});

const assetsPath =
  process.env.NODE_ENV === "development"
    ? path.join("node_modules/govuk-frontend/govuk", "./assets")
    : path.join(dirname, "./assets");

const scriptsPath =
  process.env.NODE_ENV === "development"
    ? "node_modules/govuk-frontend/govuk"
    : assetsPath;

const stylesPath =
  process.env.NODE_ENV === "development"
    ? "node_modules/govuk-frontend/govuk"
    : assetsPath;

app.use("/assets", express.static(assetsPath));
app.use("/assets/scripts", express.static(scriptsPath));
app.use("/assets/styles", express.static(stylesPath));

export { app };

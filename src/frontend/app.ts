import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import { makeCtxConfig } from "../handler-context/context-builder";
import { ConfigElements } from "../handler-context";

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

const config = await makeCtxConfig([
  ConfigElements.services,
  ConfigElements.contracts,
]);

const contracts = config.contracts.map((contract) => {
  return {
    name: `${contract.name} - ${
      config.services.find((svc) => svc.vendor_id === contract.vendor_id)
        ?.vendor_name
    }`,
    contract_id: contract.id,
  };
});

app.get("/contracts", (_, response) => {
  console.log("config", config);
  response.render("contracts.njk", {
    contracts,
  });
});

app.get("/invoices", (_, response) => {
  response.render("invoices.njk");
});

app.get("/invoices/:id", (_, response) => {
  console.log(_.params);
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

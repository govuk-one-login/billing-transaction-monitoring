import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";

let dirname;
try {
  dirname = __dirname;
} catch {
  const filePath = fileURLToPath(import.meta.url);
  dirname = path.dirname(filePath);
}

const app = express();

const viewDir = path.join(dirname, "views");

nunjucks.configure(["node_modules/govuk-frontend/", viewDir], {
  autoescape: true,
  express: app,
});

app.engine("njk", nunjucks.render);

app.get("/", (_, response) => {
  response.render("index.njk");
});

app.get("/contracts", (_, response) => {
  response.render("contracts.njk", {
    contracts: [
      { name: "foo", id: 1 },
      { name: "bar", id: 2 },
    ],
  });
});

app.get("/invoices", (_, response) => {
  response.render("invoices.njk");
});

app.get("/invoices/:id", (_, response) => {
  console.log(_.params);
  response.render("invoice.njk");
});

const govukFrontendNodeModulePath = "node_modules/govuk-frontend/govuk";
app.use("/scripts", express.static(govukFrontendNodeModulePath));
app.use("/styles", express.static(govukFrontendNodeModulePath));
app.use(
  "/assets",
  express.static(path.join(govukFrontendNodeModulePath, "./assets"))
);

export { app };

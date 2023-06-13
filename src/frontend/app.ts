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
  response.render("contracts.njk");
});
app.get("/invoices", (_, response) => {
  response.render("invoices.njk");
});
app.get("/invoices/:id", (_, response) => {
  console.log(_.params);
  response.render("invoice.njk");
});

app.use("/images", express.static(dirname));
app.use("/scripts", express.static(dirname));
app.use("/styles", express.static(path.join(dirname, "./assets/styles")));

export { app };

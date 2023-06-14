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

const imageDir = path.join(dirname, "./assets/images");
const scriptDir = path.join(dirname, "./assets/scripts");
const styleDir = path.join(dirname, "./assets/styles");
const fontDir = path.join(dirname, "./assets/fonts");

app.use("/scripts", express.static(scriptDir));
app.use("/styles", express.static(styleDir));
app.use("/assets/images", express.static(imageDir));
app.use("/assets/fonts", express.static(fontDir));

export { app };

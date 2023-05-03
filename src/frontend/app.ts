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

const imageDir = path.join(dirname, "assets/images");
const scriptDir = path.join(dirname, "assets/scripts");
const styleDir = path.join(dirname, "assets/styles");
const viewDir = path.join(dirname, "views");

nunjucks.configure(["node_modules/govuk-frontend/", viewDir], {
  autoescape: true,
  express: app,
});

app.engine("njk", nunjucks.render);

app.get("/", (_, response) => {
  response.render("index.njk");
});

app.use("/images", express.static(imageDir));
app.use("/scripts", express.static(scriptDir));
app.use("/styles", express.static(styleDir));

export { app };

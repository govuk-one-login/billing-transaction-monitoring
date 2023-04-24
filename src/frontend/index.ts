import express from "express";
import nunjucks from "nunjucks";

const PORT = process.env.PORT ?? 3000;

const app = express();

nunjucks.configure(["node_modules/govuk-frontend/", "views"], {
  autoescape: true,
  express: app,
});

app.engine("njk", nunjucks.render);

app.get("/", (_, response) => {
  response.render("index.njk");
});

app.use("/images", express.static("./assets/images"));
app.use("/scripts", express.static("./assets/scripts"));
app.use("/styles", express.static("./dist/assets/images"));

app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));

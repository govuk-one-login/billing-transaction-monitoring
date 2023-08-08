import express, { Express } from "express";
import nunjucks from "nunjucks";
import path from "path";
import "dotenv/config";
import { getHandler, getRoute, PAGES } from "./pages";
import { Middlewares, handleErrors } from "./middleware";
import { shouldLoadFromNodeModules } from "./utils/should-load-from-node-modules";
import { rootDir } from "./utils/root-dir";
import { fileURLToPath } from "url";

export const initApp = (app: Express, middlewares?: Middlewares): void => {
  middlewares?.forEach(({ handler, route }) => {
    route ? app.use(route, handler) : app.use(handler);
  });

  const viewDir = path.join(rootDir, "views");

  const templatePath = shouldLoadFromNodeModules
    ? "node_modules/govuk-frontend"
    : rootDir;

  nunjucks.configure([templatePath, viewDir], {
    autoescape: true,
    express: app,
  });

  app.engine("njk", nunjucks.render);

  PAGES.forEach((page) => {
    app.get(getRoute(page), getHandler(page));
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(
    "/security.txt",
    express.static(path.join(__dirname, "/security.txt"))
  );

  app.use(handleErrors);
};

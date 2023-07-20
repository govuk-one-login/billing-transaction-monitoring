import express, { Express } from "express";
import helmet from "helmet";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { getHandler, getRoute, PAGES } from "./pages";
import crypto from "crypto";

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
  app.use((_, response, next) => {
    response.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    next();
  });

  app.use((_, response, next) => {
    helmet({
      contentSecurityPolicy: {
        directives: {
          "connect-src": "https://accounts.google.com/gsi/",
          "frame-src": "https://accounts.google.com/gsi/",
          "script-src": ["'self'", `'nonce-${response.locals.cspNonce}'`],
          "style-src": ["'self'", "https://accounts.google.com/gsi/style"],
        },
      },
    });
    next();
  });

  const viewDir = path.join(dirname, "views");

  const templatePath = shouldLoadFromNodeModules
    ? "node_modules/govuk-frontend"
    : dirname;

  nunjucks.configure([templatePath, viewDir], {
    autoescape: true,
    express: app,
  });

  app.engine("njk", nunjucks.render);

  PAGES.forEach((page) => {
    app.get(getRoute(page), getHandler(page));
  });

  const assetsPath = shouldLoadFromNodeModules
    ? path.join("node_modules/govuk-frontend/govuk", "./assets")
    : path.join(dirname, "./assets");

  const scriptsPath = shouldLoadFromNodeModules
    ? "node_modules/govuk-frontend/govuk"
    : assetsPath;

  const stylesPath = shouldLoadFromNodeModules
    ? path.join(dirname, "./styles")
    : assetsPath;

  app.use("/assets", express.static(assetsPath));
  app.use("/assets/scripts", express.static(scriptsPath));
  app.use("/assets/styles", express.static(stylesPath));
};

import crypto from "crypto";
import helmet from "helmet";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import { shouldLoadFromNodeModules } from "./utils/should-load-from-node-modules";
import path from "path";
import { rootDir } from "./utils/root-dir";
import { logger } from "../shared/utils";
import { errorPage, getHandler } from "./pages";

export type Middlewares = Array<{ handler: RequestHandler; route?: string }>;

const generateNonce: RequestHandler = (_, response, next) => {
  response.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
};

const generateCSP: RequestHandler = (_, response, next) => {
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
};

const assetsPath = shouldLoadFromNodeModules
  ? path.join("node_modules/govuk-frontend/govuk", "./assets")
  : path.join(rootDir, "./assets");
const staticAssets = express.static(assetsPath);

const scriptsPath = shouldLoadFromNodeModules
  ? "node_modules/govuk-frontend/govuk"
  : assetsPath;
const staticScripts = express.static(scriptsPath);

const stylesPath = shouldLoadFromNodeModules
  ? path.join(rootDir, "./styles")
  : assetsPath;
const staticStyles = express.static(stylesPath);

const securityTxt: RequestHandler = (_, res) =>
  res.redirect(
    302,
    "https://vdp.cabinetoffice.gov.uk/.well-known/security.txt"
  );

export const middleware: Middlewares = [
  { handler: generateNonce },
  { handler: generateCSP },
  { handler: staticAssets, route: "/assets" },
  { handler: staticScripts, route: "/assets/scripts" },
  { handler: staticStyles, route: "/assets/styles" },
  { handler: securityTxt, route: "/.well-known/security.txt" },
];

export const unitTestMiddleware: Middlewares = [
  { handler: staticAssets, route: "/assets" },
  { handler: staticScripts, route: "/assets/scripts" },
  { handler: staticStyles, route: "/assets/styles" },
];

export const handleErrors: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  logger.error("Express app error", { error });
  const errorPageHandler = getHandler(errorPage);
  response.status(500);
  errorPageHandler(request, response, next);
};

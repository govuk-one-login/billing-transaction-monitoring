import { RequestHandler } from "express";
import { contractsHandler } from "./handlers/contracts";
import { invoicesHandler } from "./handlers/invoices";
import { invoiceHandler } from "./handlers/invoice";

export interface Page {
  parent?: Page;

  relativePath: string;

  handler: RequestHandler<any, any, any, any>;
}

export const getPagePath = (page: Page): string => {
  return page.parent ? getPathRecursive(page) : "/";
};

const getPathRecursive = (page: Page): string => {
  return (
    (page.parent ? getPathRecursive(page.parent) + "/" : "") + page.relativePath
  );
};

const indexHandler: RequestHandler = (_, response) => {
  response.render("index.njk");
};

const homePage: Page = {
  relativePath: "",
  handler: indexHandler,
};

const contractsPage: Page = {
  parent: homePage,
  relativePath: "contracts",
  handler: contractsHandler,
};

const invoicesPage: Page = {
  parent: homePage,
  relativePath: "invoices",
  handler: invoicesHandler,
};

const invoicePage: Page = {
  parent: homePage,
  relativePath: "invoice",
  handler: invoiceHandler,
};

export const PAGES = [homePage, contractsPage, invoicesPage, invoicePage];

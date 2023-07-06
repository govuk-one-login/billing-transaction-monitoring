import { Request, RequestHandler } from "express";
import { contractsParamsGetter } from "./handlers/contracts";
import { invoicesParamsGetter } from "./handlers/invoices";
import { invoiceParamsGetter } from "./handlers/invoice";

export type PageParamsGetter<TQuery> = (
  request: Request<unknown, unknown, unknown, TQuery>
) => object;

export interface Page<TQuery> {
  parent?: Page<any>;

  title: string;

  relativePath: string;

  paramsGetter: PageParamsGetter<TQuery>;

  njk: string;
}

export const getPagePath = (page: Page<any>): string => {
  return page.parent ? getPathRecursive(page) : "/";
};

const getBreadcrumbData = (
  page: Page<any>
): { items: Array<{ text: string; href: string }> } => {
  const breadcrumbs: Array<{ text: string; href: string }> = [];
  let currentPage: Page<any> | undefined = page.parent;
  while (currentPage) {
    breadcrumbs.unshift({
      text: currentPage.title,
      href: getPagePath(currentPage),
    });
    currentPage = currentPage.parent;
  }
  return { items: breadcrumbs };
};

const getPageParams = async <TQuery>(
  page: Page<TQuery>,
  request: Request<unknown, unknown, unknown, TQuery>
): Promise<object> => {
  const options = await page.paramsGetter(request);
  const breadcrumbData = getBreadcrumbData(page);
  return {
    ...options,
    breadcrumbData,
  };
};

export const getHandler = (page: Page<any>): RequestHandler => {
  return async (request, response) => {
    response.render(page.njk, await getPageParams(page, request));
  };
};

const getPathRecursive = (page: Page<any>): string => {
  return (
    (page.parent ? getPathRecursive(page.parent) + "/" : "") + page.relativePath
  );
};

const indexOptionsGetter: PageParamsGetter<{}> = (_) => ({});

const homePage: Page<{}> = {
  title: "Home",
  relativePath: "",
  njk: "index.njk",
  paramsGetter: indexOptionsGetter,
};

const contractsPage: Page<{}> = {
  title: "Contracts",
  parent: homePage,
  relativePath: "contracts",
  njk: "contracts.njk",
  paramsGetter: contractsParamsGetter,
};

const invoicesPage: Page<{ contract_id: string }> = {
  title: "Invoices",
  parent: contractsPage,
  relativePath: "invoices",
  njk: "invoices.njk",
  paramsGetter: invoicesParamsGetter,
};

const invoicePage: Page<any> = {
  title: "Invoice",
  parent: invoicesPage,
  relativePath: "invoice",
  njk: "invoice.njk",
  paramsGetter: invoiceParamsGetter,
};

export const PAGES = [homePage, contractsPage, invoicesPage, invoicePage];

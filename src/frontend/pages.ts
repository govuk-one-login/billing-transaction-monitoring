import { Request, RequestHandler } from "express";
import { contractsParamsGetter } from "./handlers/contracts";
import { invoicesParamsGetter } from "./handlers/invoices";
import { invoiceParamsGetter } from "./handlers/invoice";
import path from "node:path";

export type PageParamsGetter<TParams> = (
  request: Request<TParams, unknown, unknown, unknown>
) => object;

export interface Page<TParams> {
  parent?: Page<any>;

  title: string;

  relativePath: string;

  paramsGetter: PageParamsGetter<TParams>;

  njk: string;
}

export const getRoute = (page: Page<any>): string => {
  const parentPath = page.parent ? getRoute(page.parent) : "/";
  return path.join(parentPath, page.relativePath);
};

const getUrl = <TParams>(
  page: Page<any>,
  request: Request<TParams, unknown, unknown, unknown>
): string => {
  const parentRoute = page.parent ? getRoute(page.parent) : "/";
  let url = path.join(parentRoute, page.relativePath);
  const regex = /:([A-Za-z_]+)/;
  const params = request.params as Record<string, string>;
  while (url.match(regex)) {
    url = url.replace(regex, (a, b) => params[b]);
  }
  return url;
};

const getBreadcrumbData = <TParams>(
  page: Page<any>,
  request: Request<TParams, unknown, unknown, unknown>
): { items: Array<{ text: string; href: string }> } => {
  const breadcrumbs: Array<{ text: string; href: string }> = [];
  let currentPage: Page<any> | undefined = page.parent;
  while (currentPage) {
    breadcrumbs.unshift({
      text: currentPage.title,
      href: getUrl(currentPage, request),
    });
    currentPage = currentPage.parent;
  }
  return { items: breadcrumbs };
};

const getPageParams = async <TParams>(
  page: Page<TParams>,
  request: Request<TParams, unknown, unknown, unknown>
): Promise<object> => {
  const options = await page.paramsGetter(request);
  const breadcrumbData = getBreadcrumbData(page, request);
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

const indexOptionsGetter: PageParamsGetter<any> = (_) => ({});

const homePage: Page<any> = {
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
  relativePath: ":contract_id/invoices",
  njk: "invoices.njk",
  paramsGetter: invoicesParamsGetter,
};

const invoicePage: Page<any> = {
  title: "Invoice",
  parent: invoicesPage,
  relativePath: ":year-:month",
  njk: "invoice.njk",
  paramsGetter: invoiceParamsGetter,
};

export const PAGES = [homePage, contractsPage, invoicesPage, invoicePage];

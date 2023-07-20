import { Request, RequestHandler, Response } from "express";
import { authorisationFailedParamsGetter } from "./handlers/authorisation-failed";
import { contractsParamsGetter } from "./handlers/contracts";
import { invoicesParamsGetter } from "./handlers/invoices";
import { invoiceParamsGetter } from "./handlers/invoice";
import path from "node:path";
import {
  Contract,
  Period,
  ReconciliationRow,
  OverviewRow,
} from "./extract-helpers";
import { indexParamsGetter } from "./handlers/home";

export type PageParamsGetter<TParams, TReturn> = (
  request: Request<TParams>
) => Promise<TReturn>;

export interface Page<TParams, TReturn> {
  parent?: Page<any, any>;

  relativePath: string;

  paramsGetter: PageParamsGetter<TParams, TReturn>;

  njk: string;
}

export const getRoute = <TParams, TReturn>(
  page: Page<TParams, TReturn>
): string => {
  const parentPath = page.parent ? getRoute(page.parent) : "/";
  return path.join(parentPath, page.relativePath);
};

const getUrl = <TParams>(
  page: Page<any, any>,
  request: Request<TParams>
): string => {
  const parentRoute = page.parent ? getRoute(page.parent) : "/";
  let url = path.join(parentRoute, page.relativePath);
  const regex = /:([A-Za-z_]+)/;
  const params = request.params as Record<string, string>;
  while (regex.exec(url)) {
    url = url.replace(regex, (a, b) => params[b]);
  }
  return url;
};

const getTitle = async <TParams>(
  page: Page<any, any>,
  request: Request<TParams>
): Promise<string> => {
  return (await page.paramsGetter(request)).pageTitle;
};

const getBreadcrumbData = async <TParams>(
  page: Page<any, any>,
  request: Request<TParams>
): Promise<{ items: Array<{ text: string; href: string }> }> => {
  const breadcrumbs: Array<{ text: string; href: string }> = [];
  let currentPage: Page<any, any> | undefined = page.parent;
  while (currentPage) {
    breadcrumbs.unshift({
      text: await getTitle(currentPage, request),
      href: getUrl(currentPage, request),
    });
    currentPage = currentPage.parent;
  }
  return { items: breadcrumbs };
};
const getPageParams = async <TParams, TReturn>(
  page: Page<TParams, TReturn>,
  request: Request<TParams>,
  response: Response
): Promise<TReturn> => {
  const options = await page.paramsGetter(request);
  const breadcrumbData = await getBreadcrumbData(page, request);

  return {
    ...options,
    breadcrumbData,
    cspNonce: response.locals.cspNonce,
  };
};

export const getHandler = <TParams, TReturn>(
  page: Page<TParams, TReturn>
): RequestHandler<TParams> => {
  return async (request: Request<TParams>, response) => {
    response.render(
      page.njk,
      (await getPageParams(page, request, response)) as object
    );
  };
};

export type IndexParams = {
  pageTitle: string;
  overviewRows: OverviewRow[];
};
const homePage: Page<{}, IndexParams> = {
  relativePath: "",
  njk: "index.njk",
  paramsGetter: indexParamsGetter,
};

export type ContractParams = {
  pageTitle: string;
  contracts: Contract[];
};

const contractsPage: Page<{}, ContractParams> = {
  parent: homePage,
  relativePath: "contracts",
  njk: "contracts.njk",
  paramsGetter: contractsParamsGetter,
};

export type InvoicesParams = {
  pageTitle: string;
  contract: Contract;
  periods: Period[];
};

const invoicesPage: Page<
  {
    contract_id: string;
  },
  InvoicesParams
> = {
  parent: contractsPage,
  relativePath: ":contract_id/invoices",
  njk: "invoices.njk",
  paramsGetter: invoicesParamsGetter,
};

export type InvoiceParams = {
  pageTitle: string;
  vendorName: string;
  contractName: string;
  contractId: string;
  year: string;
  prettyMonth: string;
  bannerClass: string;
  invoiceStatus: string;
  reconciliationRows: ReconciliationRow[];
  invoiceTotals: {
    billingPriceTotal: string;
    billingPriceInclVatTotal: string;
  };
};

const invoicePage: Page<
  {
    contract_id: string;
    year: string;
    month: string;
  },
  InvoiceParams
> = {
  parent: invoicesPage,
  relativePath: ":year-:month",
  njk: "invoice.njk",
  paramsGetter: invoiceParamsGetter,
};

export type AuthorisationFailedParams = {
  pageTitle: string;
};

const authorisationFailedPage: Page<{}, AuthorisationFailedParams> = {
  relativePath: "authorisation-failed",
  njk: "authorisation-failed.njk",
  paramsGetter: authorisationFailedParamsGetter,
};

export const PAGES = [
  homePage,
  contractsPage,
  invoicesPage,
  invoicePage,
  authorisationFailedPage,
];

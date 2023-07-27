import { Request, RequestHandler, Response } from "express";
import {
  authorisationFailedParamsGetter,
  authorisationFailedTitleGetter,
} from "./handlers/authorisation-failed";
import {
  contractsParamsGetter,
  contractsTitleGetter,
} from "./handlers/contracts";
import { invoicesParamsGetter, invoicesTitleGetter } from "./handlers/invoices";
import { invoiceParamsGetter, invoiceTitleGetter } from "./handlers/invoice";
import { homeParamsGetter, homeTitleGetter } from "./handlers/home";
import path from "node:path";
import { ReconciliationRow, OverviewRow } from "./extract-helpers";
import { errorParamsGetter, errorTitleGetter } from "./handlers/error";
import { LinkData } from "./utils";
import { cookiesParamsGetter, cookiesTitleGetter } from "./handlers/cookies";

export type PageParamsGetter<TParams, TReturn> = (
  request: Request<TParams>
) => Promise<TReturn>;

export type PageTitleGetter<TParams> = keyof TParams extends never
  ? () => Promise<string>
  : (requestParams: TParams) => Promise<string>;

export interface Page<TParams, TReturn> {
  parent?: Page<any, any>;

  relativePath: string;

  paramsGetter: PageParamsGetter<TParams, TReturn>;

  njk: string;

  titleGetter: PageTitleGetter<TParams>;
}

export const getRoute = <TParams, TReturn>(
  page: Page<TParams, TReturn>
): string => {
  const parentPath = page.parent ? getRoute(page.parent) : "/";
  return path.join(parentPath, page.relativePath);
};

export const getUrl = <TParams>(
  page: Page<any, any>,
  requestParams: TParams
): string => {
  const parentRoute = page.parent ? getRoute(page.parent) : "/";
  let url = path.join(parentRoute, page.relativePath);
  const regex = /:([A-Za-z_]+)/;
  const params = requestParams as Record<string, string>;
  while (regex.exec(url)) {
    url = url.replace(regex, (a, b) => {
      const bParam = params[b];
      if (!bParam)
        throw Error(`Request parameter \`${a}\` not found for URL: ${url}`);
      return bParam;
    });
  }
  return url;
};

const getBreadcrumbData = async <TParams>(
  page: Page<any, any>,
  request: Request<TParams>
): Promise<{ items: LinkData[] }> => {
  const breadcrumbs: LinkData[] = [];
  let currentPage: Page<any, any> | undefined = page.parent;
  while (currentPage) {
    breadcrumbs.unshift({
      text: await currentPage.titleGetter(request.params),
      href: getUrl(currentPage, request.params),
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
  return (request: Request<TParams>, response, next) => {
    getPageParams(page, request, response)
      .then((pageParams) => response.render(page.njk, pageParams as object))
      .catch((error) => next(error));
  };
};

export type BasePage = {
  pageTitle: string;
  cookiesLink: LinkData;
};

export type HomeParams = BasePage & {
  overviewRows: OverviewRow[];
};

const homePage: Page<{}, {}> = {
  relativePath: "",
  njk: "home.njk",
  paramsGetter: homeParamsGetter,
  titleGetter: homeTitleGetter,
};

export type CookiesParams = BasePage & {};

export const cookiesPage: Page<{}, CookiesParams> = {
  parent: homePage,
  relativePath: "cookies",
  njk: "cookies.njk",
  paramsGetter: cookiesParamsGetter,
  titleGetter: cookiesTitleGetter,
};

export type ContractParams = BasePage & {
  invoicesLinksData: LinkData[];
};

export const contractsPage: Page<{}, ContractParams> = {
  parent: homePage,
  relativePath: "contracts",
  njk: "contracts.njk",
  paramsGetter: contractsParamsGetter,
  titleGetter: contractsTitleGetter,
};

export type InvoicesRequestParams = { contract_id: string };

export type InvoicesParams = BasePage & {
  invoiceLinksData: LinkData[];
};

export const invoicesPage: Page<InvoicesRequestParams, InvoicesParams> = {
  parent: contractsPage,
  relativePath: ":contract_id/invoices",
  njk: "invoices.njk",
  paramsGetter: invoicesParamsGetter,
  titleGetter: invoicesTitleGetter,
};

export type InvoiceRequestParams = {
  contract_id: string;
  year: string;
  month: string;
};

export type InvoiceParams = BasePage & {
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

export const invoicePage: Page<InvoiceRequestParams, InvoiceParams> = {
  parent: invoicesPage,
  relativePath: ":year-:month",
  njk: "invoice.njk",
  paramsGetter: invoiceParamsGetter,
  titleGetter: invoiceTitleGetter,
};

export type AuthorisationFailedParams = {
  pageTitle: string;
};

const authorisationFailedPage: Page<{}, AuthorisationFailedParams> = {
  relativePath: "authorisation-failed",
  njk: "authorisation-failed.njk",
  paramsGetter: authorisationFailedParamsGetter,
  titleGetter: authorisationFailedTitleGetter,
};

export type ErrorPageParams = BasePage & {
  headTitle: string;
};

// Do not add to `PAGES` array. Rendered by error handling middleware instead
export const errorPage: Page<{}, ErrorPageParams> = {
  relativePath: "",
  njk: "error.njk",
  paramsGetter: errorParamsGetter,
  titleGetter: errorTitleGetter,
};

export const PAGES = [
  homePage,
  cookiesPage,
  contractsPage,
  invoicesPage,
  invoicePage,
  authorisationFailedPage,
];

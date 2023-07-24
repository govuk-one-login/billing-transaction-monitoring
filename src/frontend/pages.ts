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
import { indexParamsGetter, indexTitleGetter } from "./handlers/home";
import path from "node:path";
import {
  Contract,
  Period,
  ReconciliationRow,
  OverviewRow,
} from "./extract-helpers";

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

const getBreadcrumbData = async <TParams>(
  page: Page<any, any>,
  request: Request<TParams>
): Promise<{ items: Array<{ text: string; href: string }> }> => {
  const breadcrumbs: Array<{ text: string; href: string }> = [];
  let currentPage: Page<any, any> | undefined = page.parent;
  while (currentPage) {
    breadcrumbs.unshift({
      text: await currentPage.titleGetter(request.params),
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
  return async (request: Request<TParams>, response, next) => {
    try {
      response.render(
        page.njk,
        (await getPageParams(page, request, response)) as object
      );
    } catch (error) {
      next(error);
    }
  };
};

export type IndexParams = {
  pageTitle: string;
  overviewRows: OverviewRow[];
};

const homePage: Page<{}, {}> = {
  relativePath: "",
  njk: "index.njk",
  paramsGetter: indexParamsGetter,
  titleGetter: indexTitleGetter,
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
  titleGetter: contractsTitleGetter,
};

export type InvoicesRequestParams = { contract_id: string };

export type InvoicesParams = {
  pageTitle: string;
  contract: Contract;
  periods: Period[];
};

const invoicesPage: Page<InvoicesRequestParams, InvoicesParams> = {
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

const invoicePage: Page<InvoiceRequestParams, InvoiceParams> = {
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

export const PAGES = [
  homePage,
  contractsPage,
  invoicesPage,
  invoicePage,
  authorisationFailedPage,
];

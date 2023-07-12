import { Request, RequestHandler } from "express";
import { contractsParamsGetter } from "./handlers/contracts";
import { invoicesParamsGetter } from "./handlers/invoices";
import { invoiceParamsGetter } from "./handlers/invoice";
import path from "node:path";
import { Contract } from "./config";
import { Period, ReconciliationRow } from "./extract-helper";

export type PageParamsGetter<TParams, TReturn> = (
  request: Request<TParams, unknown, unknown, unknown>
) => Promise<TReturn>;

export interface Page<TParams, TReturn> {
  parent?: Page<any, any>;

  title: string;

  relativePath: string;

  paramsGetter: PageParamsGetter<TParams, TReturn>;

  njk: string;
}

export const getPagePath = (page: Page<any, any>): string => {
  const parentPath = page.parent ? getPagePath(page.parent) : "/";
  return path.join(parentPath, page.relativePath);
};

const getPageParams = async <TParams, TReturn>(
  page: Page<TParams, TReturn>,
  request: Request<TParams, unknown, unknown, unknown>
): Promise<TReturn> => {
  const options = await page.paramsGetter(request);
  return {
    ...options,
    // breadcrumb data will be added here as part of BTM-648.
  };
};

export const getHandler = (page: Page<any, any>): RequestHandler => {
  return async (request, response) => {
    response.render(page.njk, await getPageParams(page, request));
  };
};

const indexOptionsGetter: PageParamsGetter<{}, {}> = async (_) => ({});

const homePage: Page<{}, {}> = {
  title: "Home",
  relativePath: "",
  njk: "index.njk",
  paramsGetter: indexOptionsGetter,
};

export type ContractParams = {
  contracts: Contract[];
};

const contractsPage: Page<{}, ContractParams> = {
  title: "Contracts",
  parent: homePage,
  relativePath: "contracts",
  njk: "contracts.njk",
  paramsGetter: contractsParamsGetter,
};

export type InvoicesParams = {
  contract: Contract;
  periods: Period[];
};

const invoicesPage: Page<
  {
    contract_id: string;
  },
  InvoicesParams
> = {
  title: "Invoices",
  parent: contractsPage,
  relativePath: ":contract_id/invoices",
  njk: "invoices.njk",
  paramsGetter: invoicesParamsGetter,
};

export type InvoiceParams = {
  classes: string;
  invoice: {
    status: string;
    vendorName: string;
    contractName: string;
    contractId: string;
    year: string;
    prettyMonth: string;
    month: string;
  };
  reconciliationRows: ReconciliationRow[];
};

const invoicePage: Page<
  {
    contract_id: string;
    year: string;
    month: string;
  },
  InvoiceParams
> = {
  title: "Invoice",
  parent: invoicesPage,
  relativePath: ":year-:month",
  njk: "invoice.njk",
  paramsGetter: invoiceParamsGetter,
};

export const PAGES = [homePage, contractsPage, invoicesPage, invoicePage];

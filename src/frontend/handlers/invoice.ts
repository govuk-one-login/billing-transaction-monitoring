import { RequestHandler } from "express";
import { getContractAndVendorName } from "../config";
import {
  getInvoiceBanner,
  getLineItems,
  getReconciliationRows,
} from "../extract-helper";
import { MONTHS } from "../frontend-utils";

export const getInvoiceHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string; year: string; month: string }
> = async (request, response) => {
  const [config, lineItems] = await Promise.all([
    getContractAndVendorName(request.query.contract_id),
    getLineItems(
      request.query.contract_id,
      request.query.year,
      request.query.month
    ),
  ]);

  const invoiceBanner = getInvoiceBanner(lineItems);

  const reconciliationRows = getReconciliationRows(lineItems);

  response.render("invoice.njk", {
    vendorName: config.vendorName,
    contractName: config.contractName,
    contractId: request.query.contract_id,
    year: request.query.year,
    prettyMonth: MONTHS[Number(request.query.month) - 1],
    bannerClass: invoiceBanner.bannerClass,
    invoiceStatus: invoiceBanner.status,
    reconciliationRows,
  });
};

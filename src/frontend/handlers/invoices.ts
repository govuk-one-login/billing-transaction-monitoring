import { RequestHandler } from "express";
import { getContractAndVendorName, getContractPeriods } from "../config";

export const getInvoicesHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string }
> = async (request, response) => {
  const [config, periods] = await Promise.all([
    getContractAndVendorName(request.query.contract_id),
    getContractPeriods(request.query.contract_id),
  ]);

  response.render("invoices.njk", {
    contract: {
      id: request.query.contract_id,
      name: config.contractName,
      vendorName: config.vendorName,
    },
    periods,
  });
};

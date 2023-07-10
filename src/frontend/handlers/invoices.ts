import { RequestHandler } from "express";
import {
  getContractAndVendorName,
  getContractPeriods,
} from "../extract-helpers";

export const getInvoicesHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string }
> = async (request, response) => {
  const [{ contractName, vendorName }, periods] = await Promise.all([
    getContractAndVendorName(request.query.contract_id),
    getContractPeriods(request.query.contract_id),
  ]);

  response.render("invoices.njk", {
    contract: {
      id: request.query.contract_id,
      name: contractName,
      vendorName,
    },
    periods,
  });
};

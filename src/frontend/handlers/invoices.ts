import { RequestHandler } from "express";
import { getContractAndVendorName, getContractPeriods } from "../config";

export const getInvoicesHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string }
> = async (request, response) => {
  const { contractName, vendorName } = await getContractAndVendorName(
    request.query.contract_id
  );

  const periods = await getContractPeriods(request.query.contract_id);

  response.render("invoices.njk", {
    contract: {
      id: request.query.contract_id,
      name: contractName,
      vendorName,
    },
    periods,
  });
};

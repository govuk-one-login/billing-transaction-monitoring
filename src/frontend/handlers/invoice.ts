import { RequestHandler } from "express";
import { getContractAndVendorName } from "../config";

export const getInvoiceHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string; year: string; month: string }
> = async (request, response) => {
  const config = await getContractAndVendorName(request.query.contract_id);

  response.render("invoice.njk", {
    ...config,
    contractId: request.query.contract_id,
  });
};

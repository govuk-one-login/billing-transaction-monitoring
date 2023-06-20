import { RequestHandler } from "express";
import { getContractName } from "./config";

export const getInvoicesHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string }
> = (request, response) => {
  console.log(request.query);
  response.render("invoices.njk", {
    contractName: getContractName(request.query.contract_id),
  });
};

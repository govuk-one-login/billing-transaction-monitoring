import { RequestHandler } from "express";
import {
  getContractData,
  getContractName,
  getContractPrettyName,
} from "../config";

export const getInvoicesHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string }
> = async (request, response) => {
  console.log(request.query);
  const contractName = await getContractName(request.query.contract_id);
  response.render("invoices.njk", {
    contractName: await getContractPrettyName(request.query.contract_id),
    contractData: await getContractData(contractName),
  });
};

import { RequestHandler } from "express";
import { getContractAndVendorName, getContractPeriods } from "../config";

export const getInvoicesHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string }
> = async (request, response) => {
  try {
    console.time("config");
    const { contractName, vendorName } = await getContractAndVendorName(
      request.query.contract_id
    );
    console.timeEnd("config");

    console.time("athena");
    const periods = await getContractPeriods(request.query.contract_id);
    console.timeEnd("athena");

    response.render("invoices.njk", {
      contract: {
        id: request.query.contract_id,
        name: contractName,
        vendorName,
      },
      periods,
    });
  } catch (error) {
    console.log("ERRORRRRR", error);
  }
};

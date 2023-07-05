import { RequestHandler } from "express";
import { getContracts } from "../config";

export const contractsHandler: RequestHandler = async (_, response) => {
  response.render("contracts.njk", {
    // breadcrumbData: getBreadcrumbData(id),
    contracts: await getContracts(),
  });
};

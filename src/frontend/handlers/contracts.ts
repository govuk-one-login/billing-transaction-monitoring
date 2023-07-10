import { RequestHandler } from "express";
import { getContracts } from "../extract-helpers";

export const contractsHandler: RequestHandler = async (_, response) => {
  response.render("contracts.njk", {
    contracts: await getContracts(),
  });
};

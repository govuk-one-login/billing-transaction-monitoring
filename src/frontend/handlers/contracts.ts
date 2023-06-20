import { RequestHandler } from "express";
import { getContracts } from "../config";

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const contractsHandler: RequestHandler = async (_, response) => {
  response.render("contracts.njk", {
    contracts: await getContracts(),
  });
};

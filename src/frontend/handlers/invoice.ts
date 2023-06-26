import { RequestHandler } from "express";
import { getContractAndVendorName, getLineItems } from "../config";

export const getInvoiceHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  { contract_id: string; year: string; month: string }
> = async (request, response) => {
  const [config, lineItems] = await Promise.all([
    getContractAndVendorName(request.query.contract_id),
    getLineItems(
      request.query.contract_id,
      request.query.year,
      request.query.month
    ),
  ]);

  let bannerColour;
  if (
    lineItems.find((lineItem) =>
      lineItem.priceDifferencePercentage.startsWith("-1234567.")
    )
  )
    bannerColour = "grey";
  else if (
    lineItems.find((lineItem) => +lineItem.priceDifferencePercentage >= 1)
  )
    bannerColour = "red";
  else if (
    lineItems.find((lineItem) => +lineItem.priceDifferencePercentage <= 1)
  )
    bannerColour = "blue";
  else bannerColour = "green";

  response.render("invoice.njk", {
    bannerColour,
    invoice: {
      statusText: "foo",
      contractName: config.contractName,
    },
  });
};

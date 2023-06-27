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

  let bannerClass;
  if (
    lineItems.find((lineItem) =>
      lineItem.priceDifferencePercentage.startsWith("-1234567.")
    )
  )
    bannerClass = "warning";
  else if (
    lineItems.find((lineItem) => +lineItem.priceDifferencePercentage >= 1)
  )
    bannerClass = "error";
  else if (
    lineItems.find((lineItem) => +lineItem.priceDifferencePercentage <= 1)
  )
    bannerClass = "notice";
  else bannerClass = "payable";

  response.render("invoice.njk", {
    classes: bannerClass,
    invoice: {
      statusText: "foo",
      contractName: config.contractName,
    },
  });
};

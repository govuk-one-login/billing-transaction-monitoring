import { RequestHandler } from "express";
import { getContractAndVendorName, getLineItems } from "../config";

const WARNINGS: Record<string, string> = {
  "-1234567.01": "No Charge For This Month",
  "-1234567.02": "Rate Card Data Missing",
  "-1234567.03": "Invoice Data Missing",
  "-1234567.04": "Transaction Data Missing",
  "-1234567.05": "Unexpected Invoice Charge",
};

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

  let title;
  let bannerClass;
  if (
    lineItems.find((lineItem) =>
      lineItem.price_difference_percentage.startsWith("-1234567.")
    )
  ) {
    title = lineItems
      .filter((lineItem) =>
        lineItem.price_difference_percentage.startsWith("-1234567.")
      )
      .map((lineItem) => WARNINGS[lineItem.price_difference_percentage])
      .filter((t, i, arr) => arr.indexOf(t) === i) // Remove dupes
      .join(",\n");
    bannerClass = "warning";
  } else if (
    lineItems.find((lineItem) => +lineItem.price_difference_percentage >= 1)
  ) {
    title = "Out of threshold";
    bannerClass = "error";
  } else if (
    lineItems.find((lineItem) => +lineItem.price_difference_percentage <= -1)
  ) {
    title = "Invoice undercharge";
    bannerClass = "notice";
  } else if (lineItems.length === 0) {
    title = "No data";
    bannerClass = "warning";
  } else {
    title = "This invoice is payable";
    bannerClass = "payable";
  }

  response.render("invoice.njk", {
    classes: bannerClass,
    invoice: {
      title,
      vendorName: config.vendorName,
      contractName: config.contractName,
      contractId: request.query.contract_id,
      year: request.query.year,
      month: request.query.month,
    },
  });
};

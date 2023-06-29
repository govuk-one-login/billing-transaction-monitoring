import { RequestHandler } from "express";
import { getContractAndVendorName, getLineItems, MONTHS } from "../config";

// Note that these are just the magic numbers that we want to show a warning for --
// there is at least one other in use that we don't show a warning for.
type PriceDifferencePercentageMagicNumber =
  | "-1234567.02"
  | "-1234567.03"
  | "-1234567.04"
  | "-1234567.05";

const WARNINGS: Record<PriceDifferencePercentageMagicNumber, string> = {
  "-1234567.03": "Invoice missing",
  "-1234567.04": "Events missing",
  "-1234567.02": "Unable to find rate",
  "-1234567.05": "Invoice has unexpected charge",
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

  let status;
  let bannerClass;
  if (lineItems.length === 0) {
    status = "Invoice and events missing";
    bannerClass = "warning";
  } else if (
    lineItems.find(
      (lineItem) => lineItem.price_difference_percentage in WARNINGS
    )
  ) {
    // We know at this point that at least one line item contains a warning, but
    // we want to find the one with the highest priority warning.
    const warningKey: string | undefined = Object.keys(WARNINGS).find((key) =>
      lineItems.find((lineItem) => lineItem.price_difference_percentage === key)
    );
    if (!warningKey) {
      throw new Error("Couldn't find line item with warning");
    }
    status = WARNINGS[warningKey as PriceDifferencePercentageMagicNumber];
    bannerClass = "warning";
  } else if (
    lineItems.find((lineItem) => +lineItem.price_difference_percentage >= 1)
  ) {
    status = "Invoice above threshold";
    bannerClass = "error";
  } else if (
    lineItems.find((lineItem) => +lineItem.price_difference_percentage <= -1)
  ) {
    status = "Invoice below threshold";
    bannerClass = "notice";
  } else {
    status = "Invoice within threshold";
    bannerClass = "payable";
  }

  response.render("invoice.njk", {
    classes: bannerClass,
    invoice: {
      title:
        config.vendorName +
        " " +
        MONTHS[Number(request.query.month) - 1] +
        " " +
        request.query.year +
        " Invoice",
      status,
      vendorName: config.vendorName,
      contractName: config.contractName,
      contractId: request.query.contract_id,
      year: request.query.year,
      month: request.query.month,
    },
  });
};

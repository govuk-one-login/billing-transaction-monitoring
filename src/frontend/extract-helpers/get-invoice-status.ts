import {
  InvoiceStatus,
  invoiceStatuses,
  LineItemStatus,
  lineItemStatuses,
} from "../utils";
import { FullExtractLineItem } from "./types";

// Note that these are just the special cases that we want to show a warning for --
// NO_CHARGE is also a possible value in a line item but, it doesn't cause a warning.
const WARNINGS_BY_PRIORITY = [
  lineItemStatuses.INVOICE_MISSING,
  lineItemStatuses.EVENTS_MISSING,
  lineItemStatuses.RATES_MISSING,
  lineItemStatuses.UNEXPECTED_CHARGE,
];

const WARNING_CODES = WARNINGS_BY_PRIORITY.map(
  (warning) => warning.magicNumber as string
);

const anyHaveWarning = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some((lineItem) =>
    WARNING_CODES.includes(lineItem.price_difference_percentage)
  );
};

const findSpecialCase = (lineItems: FullExtractLineItem[]): LineItemStatus => {
  const highestPriorityWarning = WARNINGS_BY_PRIORITY.find((warning) =>
    lineItems.find(
      (lineItem) => lineItem.price_difference_percentage === warning.magicNumber
    )
  );

  if (!highestPriorityWarning) {
    throw new Error("Couldn't find line item with warning");
  }
  return highestPriorityWarning;
};

const anyAreAboveThreshold = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some(
    (lineItem) => +lineItem.price_difference_percentage >= 1
  );
};

const anyAreBelowThreshold = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some(
    ({ price_difference_percentage }) =>
      +price_difference_percentage <= -1 &&
      price_difference_percentage !== lineItemStatuses.NO_CHARGE.magicNumber
  );
};

const anyAreNotNoCharge = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some(
    (lineItem) =>
      lineItem.price_difference_percentage !==
      lineItemStatuses.NO_CHARGE.magicNumber
  );
};

export const getInvoiceStatus = (
  lineItems: FullExtractLineItem[]
): InvoiceStatus => {
  if (lineItems.length === 0) {
    return invoiceStatuses.invoiceAndEventsMissing;
  }
  if (anyHaveWarning(lineItems)) {
    return findSpecialCase(lineItems).associatedInvoiceStatus;
  }
  if (anyAreAboveThreshold(lineItems)) {
    return invoiceStatuses.invoiceAboveThreshold;
  }
  if (anyAreBelowThreshold(lineItems)) {
    return invoiceStatuses.invoiceBelowThreshold;
  }
  if (anyAreNotNoCharge(lineItems)) {
    return invoiceStatuses.invoiceWithinThreshold;
  }
  return invoiceStatuses.invoiceHasNoCharge;
};

import { InvoiceStatus, InvoiceStatuses, invoiceStatusLookup } from "../utils";
import {
  LineItemStatus,
  LineItemStatuses,
  lineItemStatusLookup,
} from "../utils/line-item-statuses";
import { FullExtractLineItem } from "../../shared/types";

// Note that these are just the special cases that we want to show a warning for --
// NO_CHARGE is also a possible value in a line item but, it doesn't cause a warning.
const WARNINGS_BY_PRIORITY = [
  LineItemStatuses.invoiceMissing,
  LineItemStatuses.eventsMissing,
  LineItemStatuses.rateMissing,
  LineItemStatuses.unexpectedCharge,
];

const WARNING_CODES = WARNINGS_BY_PRIORITY.map(
  (warning) => lineItemStatusLookup[warning].magicNumber as string
);

const anyHaveWarning = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some((lineItem) =>
    WARNING_CODES.includes(lineItem.price_difference_percentage)
  );
};

const findWarning = (lineItems: FullExtractLineItem[]): LineItemStatus => {
  const highestPriorityWarning = WARNINGS_BY_PRIORITY.find((warning) =>
    lineItems.find(
      (lineItem) =>
        lineItem.price_difference_percentage ===
        lineItemStatusLookup[warning].magicNumber
    )
  );

  if (!highestPriorityWarning) {
    throw new Error("Couldn't find line item with warning");
  }
  return lineItemStatusLookup[highestPriorityWarning];
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
      price_difference_percentage !==
        lineItemStatusLookup[LineItemStatuses.noCharge].magicNumber
  );
};

const anyAreNotNoCharge = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some(
    (lineItem) =>
      lineItem.price_difference_percentage !==
      lineItemStatusLookup[LineItemStatuses.noCharge].magicNumber
  );
};

export const getInvoiceStatus = (
  lineItems: FullExtractLineItem[]
): InvoiceStatus => {
  if (lineItems.length === 0) {
    return invoiceStatusLookup[InvoiceStatuses.invoiceAndEventsMissing];
  }
  if (anyHaveWarning(lineItems)) {
    return invoiceStatusLookup[findWarning(lineItems).associatedInvoiceStatus];
  }
  if (anyAreAboveThreshold(lineItems)) {
    return invoiceStatusLookup[InvoiceStatuses.invoiceAboveThreshold];
  }
  if (anyAreBelowThreshold(lineItems)) {
    return invoiceStatusLookup[InvoiceStatuses.invoiceBelowThreshold];
  }
  if (anyAreNotNoCharge(lineItems)) {
    return invoiceStatusLookup[InvoiceStatuses.invoiceWithinThreshold];
  }
  return invoiceStatusLookup[InvoiceStatuses.invoiceHasNoCharge];
};

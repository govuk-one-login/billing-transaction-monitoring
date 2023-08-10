import {
  DiscrepancySpecialCase,
  InvoiceBannerClass,
  InvoiceBannerStatus,
  percentageDiscrepancySpecialCase,
} from "../utils";
import { FullExtractLineItem } from "./types";

interface InvoiceBanner {
  status: string;
  bannerClass: string;
}

// Note that these are just the special cases that we want to show a warning for --
// MN_NO_CHARGE is also a possible value in a line item but, it doesn't cause a warning.
const WARNINGS_BY_PRIORITY = [
  percentageDiscrepancySpecialCase.MN_INVOICE_MISSING,
  percentageDiscrepancySpecialCase.MN_EVENTS_MISSING,
  percentageDiscrepancySpecialCase.MN_RATES_MISSING,
  percentageDiscrepancySpecialCase.MN_UNEXPECTED_CHARGE,
];

const WARNING_CODES = WARNINGS_BY_PRIORITY.map(
  (warning) => warning.magicNumber
);

const anyHaveWarning = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some((lineItem) =>
    WARNING_CODES.includes(lineItem.price_difference_percentage)
  );
};

const findHighestPriorityWarning = (
  lineItems: FullExtractLineItem[]
): DiscrepancySpecialCase => {
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
      price_difference_percentage !==
        percentageDiscrepancySpecialCase.MN_NO_CHARGE.magicNumber
  );
};

const anyAreNotNoCharge = (lineItems: FullExtractLineItem[]): boolean => {
  return lineItems.some(
    (lineItem) =>
      lineItem.price_difference_percentage !==
      percentageDiscrepancySpecialCase.MN_NO_CHARGE.magicNumber
  );
};

export const getInvoiceBanner = (
  lineItems: FullExtractLineItem[]
): InvoiceBanner => {
  let status;
  let bannerClass;
  if (lineItems.length === 0) {
    status = InvoiceBannerStatus.invoiceAndEventsMissing;
    bannerClass = InvoiceBannerClass.notice;
  } else if (anyHaveWarning(lineItems)) {
    const highestPriorityWarning = findHighestPriorityWarning(lineItems);
    status = highestPriorityWarning.bannerText;
    bannerClass = highestPriorityWarning.bannerClass;
  } else if (anyAreAboveThreshold(lineItems)) {
    status = InvoiceBannerStatus.invoiceAboveThreshold;
    bannerClass = InvoiceBannerClass.warning;
  } else if (anyAreBelowThreshold(lineItems)) {
    status = InvoiceBannerStatus.invoiceBelowThreshold;
    bannerClass = InvoiceBannerClass.notice;
  } else if (anyAreNotNoCharge(lineItems)) {
    status = InvoiceBannerStatus.invoiceWithinThreshold;
    bannerClass = InvoiceBannerClass.payable;
  } else {
    status = InvoiceBannerStatus.invoiceHasNoCharge;
    bannerClass = InvoiceBannerClass.payable;
  }
  return {
    status,
    bannerClass,
  };
};

import { StatusLabel } from "./status-label";
import { InvoiceStatuses } from "./invoice-statuses";

export enum LineItemMagicNumber {
  noCharge = "-1234567.01",
  ratesMissing = "-1234567.02",
  invoiceMissing = "-1234567.03",
  eventsMissing = "-1234567.04",
  unexpectedCharge = "-1234567.05",
}

export type LineItemStatus = {
  magicNumber?: LineItemMagicNumber;
  associatedInvoiceStatus: InvoiceStatuses;
  statusLabel: StatusLabel;
};

export enum LineItemStatuses {
  noCharge,
  rateMissing,
  invoiceMissing,
  eventsMissing,
  unexpectedCharge,
  aboveThreshold,
  belowThreshold,
  withinThreshold,
}

export const lineItemStatusLabelLookup: Record<LineItemStatuses, StatusLabel> =
  {
    [LineItemStatuses.noCharge]: {
      message: "No Charge",
      class: "govuk-tag--green",
    },
    [LineItemStatuses.rateMissing]: {
      message: "Rate Missing",
      class: "govuk-tag--red",
    },
    [LineItemStatuses.invoiceMissing]: {
      message: "Invoice Missing",
      class: "govuk-tag--yellow",
    },
    [LineItemStatuses.eventsMissing]: {
      message: "Events Missing",
      class: "govuk-tag--red",
    },
    [LineItemStatuses.unexpectedCharge]: {
      message: "Unexpected Charge",
      class: "govuk-tag--yellow",
    },
    [LineItemStatuses.aboveThreshold]: {
      message: "Above Threshold",
      class: "govuk-tag--yellow",
    },
    [LineItemStatuses.belowThreshold]: {
      message: "Below Threshold",
      class: "govuk-tag--green",
    },
    [LineItemStatuses.withinThreshold]: {
      message: "Within Threshold",
      class: "govuk-tag--green",
    },
  };

export const lineItemStatusLookup: Record<LineItemStatuses, LineItemStatus> = {
  [LineItemStatuses.noCharge]: {
    magicNumber: LineItemMagicNumber.noCharge,
    associatedInvoiceStatus: InvoiceStatuses.invoiceHasNoCharge,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.noCharge],
  },
  [LineItemStatuses.rateMissing]: {
    magicNumber: LineItemMagicNumber.ratesMissing,
    associatedInvoiceStatus: InvoiceStatuses.unableToFindRate,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.rateMissing],
  },
  [LineItemStatuses.invoiceMissing]: {
    magicNumber: LineItemMagicNumber.invoiceMissing,
    associatedInvoiceStatus: InvoiceStatuses.invoiceDataMissing,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.invoiceMissing],
  },
  [LineItemStatuses.eventsMissing]: {
    magicNumber: LineItemMagicNumber.eventsMissing,
    associatedInvoiceStatus: InvoiceStatuses.eventsMissing,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.eventsMissing],
  },
  [LineItemStatuses.unexpectedCharge]: {
    magicNumber: LineItemMagicNumber.unexpectedCharge,
    associatedInvoiceStatus: InvoiceStatuses.invoiceHasUnexpectedCharge,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.unexpectedCharge],
  },
  [LineItemStatuses.aboveThreshold]: {
    associatedInvoiceStatus: InvoiceStatuses.invoiceAboveThreshold,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.aboveThreshold],
  },
  [LineItemStatuses.belowThreshold]: {
    associatedInvoiceStatus: InvoiceStatuses.invoiceBelowThreshold,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.belowThreshold],
  },
  [LineItemStatuses.withinThreshold]: {
    associatedInvoiceStatus: InvoiceStatuses.invoiceWithinThreshold,
    statusLabel: lineItemStatusLabelLookup[LineItemStatuses.withinThreshold],
  },
};

export const findLineItemStatus = (
  percentageDiscrepancy: string
): LineItemStatus => {
  const match = Object.entries(lineItemStatusLookup).find(
    ([_, status]) => status.magicNumber === percentageDiscrepancy
  );
  if (match) {
    return match[1];
  }

  if (+percentageDiscrepancy >= 1)
    return lineItemStatusLookup[LineItemStatuses.aboveThreshold];
  if (+percentageDiscrepancy <= -1)
    return lineItemStatusLookup[LineItemStatuses.belowThreshold];
  return lineItemStatusLookup[LineItemStatuses.withinThreshold];
};

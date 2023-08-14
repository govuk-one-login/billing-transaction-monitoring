import { StatusLabel, statusLabelLookup, StatusLabels } from "./status-label";
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
  ratesMissing,
  invoiceMissing,
  eventsMissing,
  unexpectedCharge,
  aboveThreshold,
  belowThreshold,
  withinThreshold,
}

export const lineItemStatusLookup: Record<LineItemStatuses, LineItemStatus> = {
  [LineItemStatuses.noCharge]: {
    magicNumber: LineItemMagicNumber.noCharge,
    associatedInvoiceStatus: InvoiceStatuses.noCharge,
    statusLabel: statusLabelLookup[StatusLabels.noCharge],
  },
  [LineItemStatuses.ratesMissing]: {
    magicNumber: LineItemMagicNumber.ratesMissing,
    associatedInvoiceStatus: InvoiceStatuses.unableToFindRate,
    statusLabel: statusLabelLookup[StatusLabels.error],
  },
  [LineItemStatuses.invoiceMissing]: {
    magicNumber: LineItemMagicNumber.invoiceMissing,
    associatedInvoiceStatus: InvoiceStatuses.invoiceDataMissing,
    statusLabel: statusLabelLookup[StatusLabels.pending],
  },
  [LineItemStatuses.eventsMissing]: {
    magicNumber: LineItemMagicNumber.eventsMissing,
    associatedInvoiceStatus: InvoiceStatuses.eventsMissing,
    statusLabel: statusLabelLookup[StatusLabels.error],
  },
  [LineItemStatuses.unexpectedCharge]: {
    magicNumber: LineItemMagicNumber.unexpectedCharge,
    associatedInvoiceStatus: InvoiceStatuses.unexpectedInvoiceCharge,
    statusLabel: statusLabelLookup[StatusLabels.unexpectedCharge],
  },
  [LineItemStatuses.aboveThreshold]: {
    associatedInvoiceStatus: InvoiceStatuses.invoiceAboveThreshold,
    statusLabel: statusLabelLookup[StatusLabels.aboveThreshold],
  },
  [LineItemStatuses.belowThreshold]: {
    associatedInvoiceStatus: InvoiceStatuses.invoiceBelowThreshold,
    statusLabel: statusLabelLookup[StatusLabels.belowThreshold],
  },
  [LineItemStatuses.withinThreshold]: {
    associatedInvoiceStatus: InvoiceStatuses.invoiceWithinThreshold,
    statusLabel: statusLabelLookup[StatusLabels.withinThreshold],
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

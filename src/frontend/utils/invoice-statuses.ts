import { StatusLabel, statusLabels } from "./status-label";

export enum LineItemMagicNumber {
  noCharge = "-1234567.01",
  ratesMissing = "-1234567.02",
  invoiceMissing = "-1234567.03",
  eventsMissing = "-1234567.04",
  unexpectedCharge = "-1234567.05",
}

export enum InvoiceBannerClass {
  warning = "warning",
  error = "error",
  notice = "notice",
  payable = "payable",
}

export type InvoiceStatus = {
  bannerText: string;
  bannerClass: string;
  statusLabel: StatusLabel;
};

type InvoiceStatuses = {
  [key: string]: InvoiceStatus;
};

export const invoiceStatuses: InvoiceStatuses = {
  invoiceAndEventsMissing: {
    bannerText: "Invoice and events missing",
    bannerClass: InvoiceBannerClass.notice,
    statusLabel: statusLabels.PENDING,
  },
  noCharge: {
    bannerText: "No charge",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabels.NO_CHARGE,
  },
  unableToFindRate: {
    bannerText: "Unable to find rate",
    bannerClass: InvoiceBannerClass.error,
    statusLabel: statusLabels.ERROR,
  },
  invoiceDataMissing: {
    bannerText: "Invoice data missing",
    bannerClass: InvoiceBannerClass.notice,
    statusLabel: statusLabels.PENDING,
  },
  eventsMissing: {
    bannerText: "Events missing",
    bannerClass: InvoiceBannerClass.error,
    statusLabel: statusLabels.ERROR,
  },
  unexpectedInvoiceCharge: {
    bannerText: "Unexpected invoice charge",
    bannerClass: InvoiceBannerClass.warning,
    statusLabel: statusLabels.UNEXPECTED_CHARGE,
  },
  invoiceAboveThreshold: {
    bannerText: "Invoice above threshold",
    bannerClass: InvoiceBannerClass.warning,
    statusLabel: statusLabels.ABOVE_THRESHOLD,
  },
  invoiceBelowThreshold: {
    bannerText: "Invoice below threshold",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabels.BELOW_THRESHOLD,
  },
  invoiceWithinThreshold: {
    bannerText: "Invoice within threshold",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabels.WITHIN_THRESHOLD,
  },
  invoiceHasNoCharge: {
    bannerText: "Invoice has no charge",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabels.NO_CHARGE,
  },
};

export type LineItemStatus = {
  magicNumber?: LineItemMagicNumber;
  associatedInvoiceStatus: InvoiceStatus;
  statusLabel: StatusLabel;
};

type LineItemStatuses = {
  [key: string]: LineItemStatus;
};

export const lineItemStatuses: LineItemStatuses = {
  NO_CHARGE: {
    magicNumber: LineItemMagicNumber.noCharge,
    associatedInvoiceStatus: invoiceStatuses.noCharge,
    statusLabel: statusLabels.NO_CHARGE,
  },
  RATES_MISSING: {
    magicNumber: LineItemMagicNumber.ratesMissing,
    associatedInvoiceStatus: invoiceStatuses.unableToFindRate,
    statusLabel: statusLabels.ERROR,
  },
  INVOICE_MISSING: {
    magicNumber: LineItemMagicNumber.invoiceMissing,
    associatedInvoiceStatus: invoiceStatuses.invoiceDataMissing,
    statusLabel: statusLabels.PENDING,
  },
  EVENTS_MISSING: {
    magicNumber: LineItemMagicNumber.eventsMissing,
    associatedInvoiceStatus: invoiceStatuses.eventsMissing,
    statusLabel: statusLabels.ERROR,
  },
  UNEXPECTED_CHARGE: {
    magicNumber: LineItemMagicNumber.unexpectedCharge,
    associatedInvoiceStatus: invoiceStatuses.unexpectedInvoiceCharge,
    statusLabel: statusLabels.UNEXPECTED_CHARGE,
  },
  ABOVE_THRESHOLD: {
    associatedInvoiceStatus: invoiceStatuses.invoiceAboveThreshold,
    statusLabel: statusLabels.ABOVE_THRESHOLD,
  },
  BELOW_THRESHOLD: {
    associatedInvoiceStatus: invoiceStatuses.invoiceBelowThreshold,
    statusLabel: statusLabels.BELOW_THRESHOLD,
  },
  WITHIN_THRESHOLD: {
    associatedInvoiceStatus: invoiceStatuses.invoiceWithinThreshold,
    statusLabel: statusLabels.WITHIN_THRESHOLD,
  },
};

export const findLineItemStatus = (
  percentageDiscrepancy: string
): LineItemStatus | undefined => {
  const match = Object.entries(lineItemStatuses).find(
    ([_, status]) => status.magicNumber === percentageDiscrepancy
  );
  if (match) {
    return match[1];
  }

  if (+percentageDiscrepancy >= 1) return lineItemStatuses.ABOVE_THRESHOLD;
  if (+percentageDiscrepancy <= -1) return lineItemStatuses.BELOW_THRESHOLD;
  return lineItemStatuses.WITHIN_THRESHOLD;
};

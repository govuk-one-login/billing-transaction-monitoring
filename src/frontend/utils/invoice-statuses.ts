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
};

type InvoiceStatuses = {
  [key: string]: InvoiceStatus;
};

export const invoiceStatuses: InvoiceStatuses = {
  invoiceAndEventsMissing: {
    bannerText: "Invoice and events missing",
    bannerClass: InvoiceBannerClass.notice,
  },
  noCharge: {
    bannerText: "No charge",
    bannerClass: InvoiceBannerClass.payable,
  },
  unableToFindRate: {
    bannerText: "Unable to find rate",
    bannerClass: InvoiceBannerClass.error,
  },
  invoiceDataMissing: {
    bannerText: "Invoice data missing",
    bannerClass: InvoiceBannerClass.notice,
  },
  eventsMissing: {
    bannerText: "Events missing",
    bannerClass: InvoiceBannerClass.error,
  },
  unexpectedInvoiceCharge: {
    bannerText: "Unexpected invoice charge",
    bannerClass: InvoiceBannerClass.warning,
  },
  invoiceAboveThreshold: {
    bannerText: "Invoice above threshold",
    bannerClass: InvoiceBannerClass.warning,
  },
  invoiceBelowThreshold: {
    bannerText: "Invoice below threshold",
    bannerClass: InvoiceBannerClass.payable,
  },
  invoiceWithinThreshold: {
    bannerText: "Invoice within threshold",
    bannerClass: InvoiceBannerClass.payable,
  },
  invoiceHasNoCharge: {
    bannerText: "Invoice has no charge",
    bannerClass: InvoiceBannerClass.payable,
  },
};

export type LineItemStatus = {
  magicNumber: LineItemMagicNumber;
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
    statusLabel: statusLabels.STATUS_LABEL_NO_CHARGE,
  },
  RATES_MISSING: {
    magicNumber: LineItemMagicNumber.ratesMissing,
    associatedInvoiceStatus: invoiceStatuses.unableToFindRate,
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
  INVOICE_MISSING: {
    magicNumber: LineItemMagicNumber.invoiceMissing,
    associatedInvoiceStatus: invoiceStatuses.invoiceDataMissing,
    statusLabel: statusLabels.STATUS_LABEL_PENDING,
  },
  EVENTS_MISSING: {
    magicNumber: LineItemMagicNumber.eventsMissing,
    associatedInvoiceStatus: invoiceStatuses.eventsMissing,
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
  UNEXPECTED_CHARGE: {
    magicNumber: LineItemMagicNumber.unexpectedCharge,
    associatedInvoiceStatus: invoiceStatuses.unexpectedInvoiceCharge,
    statusLabel: statusLabels.STATUS_LABEL_UNEXPECTED_CHARGE,
  },
};

export const findLineItemStatusByMagicNumber = (
  maybeMagicNumber: string
): LineItemStatus | undefined => {
  const match = Object.entries(lineItemStatuses).find(
    ([_, status]) => status.magicNumber === maybeMagicNumber
  );
  if (match) {
    return match[1];
  }
  return undefined;
};

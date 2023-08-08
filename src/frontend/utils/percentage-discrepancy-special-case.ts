import { statusLabels } from "./status-label";

export enum InvoiceBannerStatus {
  invoiceAndEventsMissing = "Invoice and events missing",
  noCharge = "No charge",
  unableToFindRate = "Unable to find rate",
  invoiceDataMissing = "Invoice data missing",
  eventsMissing = "Events missing",
  unexpectedInvoiceCharge = "Unexpected invoice charge",
  invoiceAboveThreshold = "Invoice above threshold",
  invoiceBelowThreshold = "Invoice below threshold",
  invoiceWithinThreshold = "Invoice within threshold",
}

export enum InvoiceBannerClass {
  warning = "warning",
  error = "error",
  notice = "notice",
  payable = "payable",
}

export const percentageDiscrepancySpecialCase = {
  MN_NO_CHARGE: {
    magicNumber: "-1234567.01",
    bannerText: InvoiceBannerStatus.noCharge,
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabels.STATUS_LABEL_WITHIN_THRESHOLD,
  },
  MN_RATES_MISSING: {
    magicNumber: "-1234567.02",
    bannerText: InvoiceBannerStatus.unableToFindRate,
    bannerClass: InvoiceBannerClass.error,
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
  MN_INVOICE_MISSING: {
    magicNumber: "-1234567.03",
    bannerText: InvoiceBannerStatus.invoiceDataMissing,
    bannerClass: InvoiceBannerClass.notice,
    statusLabel: statusLabels.STATUS_LABEL_PENDING,
  },
  MN_EVENTS_MISSING: {
    magicNumber: "-1234567.04",
    bannerText: InvoiceBannerStatus.eventsMissing,
    bannerClass: InvoiceBannerClass.error,
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
  MN_UNEXPECTED_CHARGE: {
    magicNumber: "-1234567.05",
    bannerText: InvoiceBannerStatus.unexpectedInvoiceCharge,
    bannerClass: InvoiceBannerClass.warning,
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
};

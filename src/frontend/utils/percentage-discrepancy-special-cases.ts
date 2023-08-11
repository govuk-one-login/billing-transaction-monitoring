import { StatusLabel, statusLabels } from "./status-label";

export enum PercentageDiscrepancyMagicNumber {
  noCharge = "-1234567.01",
  ratesMissing = "-1234567.02",
  invoiceMissing = "-1234567.03",
  eventsMissing = "-1234567.04",
  unexpectedCharge = "-1234567.05",
}

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
  invoiceHasNoCharge = "Invoice has no charge",
}

export enum InvoiceBannerClass {
  warning = "warning",
  error = "error",
  notice = "notice",
  payable = "payable",
}

export type PercentageDiscrepancySpecialCase = {
  magicNumber: PercentageDiscrepancyMagicNumber;
  bannerText: InvoiceBannerStatus;
  bannerClass: InvoiceBannerClass;
  statusLabel: StatusLabel;
};

type PercentageDiscrepancySpecialCases = {
  [key: string]: PercentageDiscrepancySpecialCase;
};

export const percentageDiscrepancySpecialCases: PercentageDiscrepancySpecialCases =
  {
    MN_NO_CHARGE: {
      magicNumber: PercentageDiscrepancyMagicNumber.noCharge,
      bannerText: InvoiceBannerStatus.noCharge,
      bannerClass: InvoiceBannerClass.payable,
      statusLabel: statusLabels.STATUS_LABEL_NO_CHARGE,
    },
    MN_RATES_MISSING: {
      magicNumber: PercentageDiscrepancyMagicNumber.ratesMissing,
      bannerText: InvoiceBannerStatus.unableToFindRate,
      bannerClass: InvoiceBannerClass.error,
      statusLabel: statusLabels.STATUS_LABEL_ERROR,
    },
    MN_INVOICE_MISSING: {
      magicNumber: PercentageDiscrepancyMagicNumber.invoiceMissing,
      bannerText: InvoiceBannerStatus.invoiceDataMissing,
      bannerClass: InvoiceBannerClass.notice,
      statusLabel: statusLabels.STATUS_LABEL_PENDING,
    },
    MN_EVENTS_MISSING: {
      magicNumber: PercentageDiscrepancyMagicNumber.eventsMissing,
      bannerText: InvoiceBannerStatus.eventsMissing,
      bannerClass: InvoiceBannerClass.error,
      statusLabel: statusLabels.STATUS_LABEL_ERROR,
    },
    MN_UNEXPECTED_CHARGE: {
      magicNumber: PercentageDiscrepancyMagicNumber.unexpectedCharge,
      bannerText: InvoiceBannerStatus.unexpectedInvoiceCharge,
      bannerClass: InvoiceBannerClass.warning,
      statusLabel: statusLabels.STATUS_LABEL_UNEXPECTED_CHARGE,
    },
  };

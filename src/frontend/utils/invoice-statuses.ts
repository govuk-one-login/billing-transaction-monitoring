import { StatusLabel, statusLabelLookup, StatusLabels } from "./status-label";

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

export enum InvoiceStatuses {
  invoiceAndEventsMissing,
  noCharge,
  unableToFindRate,
  invoiceDataMissing,
  eventsMissing,
  unexpectedInvoiceCharge,
  invoiceAboveThreshold,
  invoiceBelowThreshold,
  invoiceWithinThreshold,
  invoiceHasNoCharge,
}

export const invoiceStatusLookup: Record<InvoiceStatuses, InvoiceStatus> = {
  [InvoiceStatuses.invoiceAndEventsMissing]: {
    bannerText: "Invoice and events missing",
    bannerClass: InvoiceBannerClass.notice,
    statusLabel: statusLabelLookup[StatusLabels.pending],
  },
  [InvoiceStatuses.noCharge]: {
    bannerText: "No charge",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabelLookup[StatusLabels.noCharge],
  },
  [InvoiceStatuses.unableToFindRate]: {
    bannerText: "Unable to find rate",
    bannerClass: InvoiceBannerClass.error,
    statusLabel: statusLabelLookup[StatusLabels.error],
  },
  [InvoiceStatuses.invoiceDataMissing]: {
    bannerText: "Invoice data missing",
    bannerClass: InvoiceBannerClass.notice,
    statusLabel: statusLabelLookup[StatusLabels.pending],
  },
  [InvoiceStatuses.eventsMissing]: {
    bannerText: "Events missing",
    bannerClass: InvoiceBannerClass.error,
    statusLabel: statusLabelLookup[StatusLabels.error],
  },
  [InvoiceStatuses.unexpectedInvoiceCharge]: {
    bannerText: "Unexpected invoice charge",
    bannerClass: InvoiceBannerClass.warning,
    statusLabel: statusLabelLookup[StatusLabels.unexpectedCharge],
  },
  [InvoiceStatuses.invoiceAboveThreshold]: {
    bannerText: "Invoice above threshold",
    bannerClass: InvoiceBannerClass.warning,
    statusLabel: statusLabelLookup[StatusLabels.aboveThreshold],
  },
  [InvoiceStatuses.invoiceBelowThreshold]: {
    bannerText: "Invoice below threshold",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabelLookup[StatusLabels.belowThreshold],
  },
  [InvoiceStatuses.invoiceWithinThreshold]: {
    bannerText: "Invoice within threshold",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabelLookup[StatusLabels.withinThreshold],
  },
  [InvoiceStatuses.invoiceHasNoCharge]: {
    bannerText: "Invoice has no charge",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: statusLabelLookup[StatusLabels.noCharge],
  },
};

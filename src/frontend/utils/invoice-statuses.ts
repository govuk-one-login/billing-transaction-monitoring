import { StatusLabel } from "./status-label";

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
  invoiceDataMissing,
  eventsMissing,
  unableToFindRate,
  invoiceHasUnexpectedCharge,
  invoiceAboveThreshold,
  invoiceBelowThreshold,
  invoiceWithinThreshold,
  invoiceHasNoCharge,
}

export const invoiceStatusLabelLookup: Record<InvoiceStatuses, StatusLabel> = {
  [InvoiceStatuses.invoiceAndEventsMissing]: {
    message: "Pending",
    class: "govuk-tag--blue",
  },
  [InvoiceStatuses.invoiceDataMissing]: {
    message: "Pending",
    class: "govuk-tag--blue",
  },

  [InvoiceStatuses.eventsMissing]: {
    message: "Error",
    class: "govuk-tag--red",
  },
  [InvoiceStatuses.unableToFindRate]: {
    message: "Error",
    class: "govuk-tag--red",
  },

  [InvoiceStatuses.invoiceHasUnexpectedCharge]: {
    message: "Warning",
    class: "govuk-tag--yellow",
  },
  [InvoiceStatuses.invoiceAboveThreshold]: {
    message: "Warning",
    class: "govuk-tag--yellow",
  },

  [InvoiceStatuses.invoiceBelowThreshold]: {
    message: "Below Threshold",
    class: "govuk-tag--green",
  },
  [InvoiceStatuses.invoiceWithinThreshold]: {
    message: "Within Threshold",
    class: "govuk-tag--green",
  },
  [InvoiceStatuses.invoiceHasNoCharge]: {
    message: "No Charge",
    class: "govuk-tag--green",
  },
};

export const invoiceStatusLookup: Record<InvoiceStatuses, InvoiceStatus> = {
  [InvoiceStatuses.invoiceAndEventsMissing]: {
    bannerText: "Invoice and events missing",
    bannerClass: InvoiceBannerClass.notice,
    statusLabel:
      invoiceStatusLabelLookup[InvoiceStatuses.invoiceAndEventsMissing],
  },
  [InvoiceStatuses.invoiceHasNoCharge]: {
    bannerText: "Invoice has no charge",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.invoiceHasNoCharge],
  },
  [InvoiceStatuses.unableToFindRate]: {
    bannerText: "Unable to find rate",
    bannerClass: InvoiceBannerClass.error,
    statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.unableToFindRate],
  },
  [InvoiceStatuses.invoiceDataMissing]: {
    bannerText: "Invoice data missing",
    bannerClass: InvoiceBannerClass.notice,
    statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.invoiceDataMissing],
  },
  [InvoiceStatuses.eventsMissing]: {
    bannerText: "Events missing",
    bannerClass: InvoiceBannerClass.error,
    statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.eventsMissing],
  },
  [InvoiceStatuses.invoiceHasUnexpectedCharge]: {
    bannerText: "Unexpected invoice charge",
    bannerClass: InvoiceBannerClass.warning,
    statusLabel:
      invoiceStatusLabelLookup[InvoiceStatuses.invoiceHasUnexpectedCharge],
  },
  [InvoiceStatuses.invoiceAboveThreshold]: {
    bannerText: "Invoice above threshold",
    bannerClass: InvoiceBannerClass.warning,
    statusLabel:
      invoiceStatusLabelLookup[InvoiceStatuses.invoiceAboveThreshold],
  },
  [InvoiceStatuses.invoiceBelowThreshold]: {
    bannerText: "Invoice below threshold",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel:
      invoiceStatusLabelLookup[InvoiceStatuses.invoiceBelowThreshold],
  },
  [InvoiceStatuses.invoiceWithinThreshold]: {
    bannerText: "Invoice within threshold",
    bannerClass: InvoiceBannerClass.payable,
    statusLabel:
      invoiceStatusLabelLookup[InvoiceStatuses.invoiceWithinThreshold],
  },
};

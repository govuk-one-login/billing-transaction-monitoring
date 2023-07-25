export const TEST_DATA_FILE_PATH = "../testData/testData.json";

export enum InvoiceStates {
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

export enum Color {
  green = "#00703c",
  grey = "#b1b4b6",
  blue = "#1d70b8",
  red = "#d4351c",
}

export const statusLabels = {
  STATUS_LABEL_WITHIN_THRESHOLD: {
    message: "WITHIN THRESHOLD",
  },
  STATUS_LABEL_BELOW_THRESHOLD: {
    message: "BELOW THRESHOLD",
  },
  STATUS_LABEL_ABOVE_THRESHOLD: {
    message: "ABOVE THRESHOLD",
  },
  STATUS_LABEL_PENDING: {
    message: "PENDING",
  },
  STATUS_LABEL_ERROR: {
    message: "ERROR",
  },
};

export const percentageDiscrepancySpecialCase: Record<
  string,
  { bannerText: string; bannerColor: string; statusLabel: string }
> = {
  "-1234567.01": {
    bannerText: InvoiceStates.noCharge,
    bannerColor: Color.green, // bug BTM-709
    statusLabel: statusLabels.STATUS_LABEL_WITHIN_THRESHOLD.message,
  },
  "-1234567.02": {
    bannerText: InvoiceStates.unableToFindRate,
    bannerColor: Color.grey,
    statusLabel: statusLabels.STATUS_LABEL_ERROR.message,
  },
  "-1234567.03": {
    bannerText: InvoiceStates.invoiceDataMissing,
    bannerColor: Color.grey,
    statusLabel: statusLabels.STATUS_LABEL_PENDING.message,
  },
  "-1234567.04": {
    bannerText: InvoiceStates.eventsMissing,
    bannerColor: Color.grey,
    statusLabel: statusLabels.STATUS_LABEL_ERROR.message,
  },
  "-1234567.05": {
    bannerText: InvoiceStates.unexpectedInvoiceCharge,
    bannerColor: Color.grey, // bug BTM-710
    statusLabel: statusLabels.STATUS_LABEL_ABOVE_THRESHOLD.message, // bug BTM-710
  },
};

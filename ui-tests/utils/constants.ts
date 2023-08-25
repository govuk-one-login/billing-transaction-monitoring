export const TEST_DATA_FILE_PATH = "../testData/testData.txt";

export enum InvoiceStates {
  invoiceAndEventsMissing = "Invoice and events missing",
  noCharge = "Invoice has no charge",
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
  yellow = "#ffdd00",
}

export const statusLabels = {
  STATUS_LABEL_WITHIN_THRESHOLD: {
    message: "WITHIN THRESHOLD",
    overviewTableStatus: "WITHIN THRESHOLD",
  },
  STATUS_LABEL_NO_CHARGE: {
    message: "NO CHARGE",
    overviewTableStatus: "NO CHARGE",
  },
  STATUS_LABEL_BELOW_THRESHOLD: {
    message: "BELOW THRESHOLD",
    overviewTableStatus: "BELOW THRESHOLD",
  },
  STATUS_LABEL_ABOVE_THRESHOLD: {
    message: "ABOVE THRESHOLD",
    overviewTableStatus: "WARNING",
  },
  STATUS_LABEL_INVOICE_MISSING: {
    message: "INVOICE MISSING",
    overviewTableStatus: "PENDING",
  },
  STATUS_LABEL_RATE_MISSING: {
    message: "RATE MISSING",
    overviewTableStatus: "ERROR",
  },
  STATUS_LABEL_EVENTS_MISSING: {
    message: "EVENTS MISSING",
    overviewTableStatus: "ERROR",
  },
  STATUS_LABEL_UNEXPECTED_CHARGE: {
    message: "UNEXPECTED CHARGE",
    overviewTableStatus: "WARNING",
  },
};

export const percentageDiscrepancySpecialCase: Record<
  string,
  {
    overviewTableStatus: string;
    bannerText: string;
    bannerColor: string;
    statusLabel: string;
    percentageDiscrepancy: string;
  }
> = {
  "-1234567.01": {
    overviewTableStatus: "NO CHARGE",
    bannerText: InvoiceStates.noCharge,
    bannerColor: Color.green,
    statusLabel: statusLabels.STATUS_LABEL_NO_CHARGE.message,
    percentageDiscrepancy: InvoiceStates.noCharge,
  },
  "-1234567.02": {
    overviewTableStatus: "ERROR",
    bannerText: InvoiceStates.unableToFindRate,
    bannerColor: Color.red,
    statusLabel: statusLabels.STATUS_LABEL_RATE_MISSING.message,
    percentageDiscrepancy: InvoiceStates.unableToFindRate,
  },
  "-1234567.03": {
    overviewTableStatus: "PENDING",
    bannerText: InvoiceStates.invoiceDataMissing,
    bannerColor: Color.blue,
    statusLabel: statusLabels.STATUS_LABEL_INVOICE_MISSING.message,
    percentageDiscrepancy: InvoiceStates.invoiceDataMissing,
  },
  "-1234567.04": {
    overviewTableStatus: "ERROR",
    bannerText: InvoiceStates.eventsMissing,
    bannerColor: Color.red,
    statusLabel: statusLabels.STATUS_LABEL_EVENTS_MISSING.message,
    percentageDiscrepancy: InvoiceStates.eventsMissing,
  },
  "-1234567.05": {
    overviewTableStatus: "WARNING",
    bannerText: InvoiceStates.unexpectedInvoiceCharge,
    bannerColor: Color.yellow,
    statusLabel: statusLabels.STATUS_LABEL_UNEXPECTED_CHARGE.message,
    percentageDiscrepancy: InvoiceStates.unexpectedInvoiceCharge,
  },
};

import { statusLabels } from "./status-label";

export const percentageDiscrepancySpecialCase = {
  MN_NO_CHARGE: {
    magicNumber: "-1234567.01",
    bannerText: "No charge",
    statusLabel: statusLabels.STATUS_LABEL_WITHIN_THRESHOLD,
  },
  MN_RATES_MISSING: {
    magicNumber: "-1234567.02",
    bannerText: "Unable to find rate",
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
  MN_INVOICE_MISSING: {
    magicNumber: "-1234567.03",
    bannerText: "Invoice data missing",
    statusLabel: statusLabels.STATUS_LABEL_PENDING,
  },
  MN_EVENTS_MISSING: {
    magicNumber: "-1234567.04",
    bannerText: "Events missing",
    statusLabel: statusLabels.STATUS_LABEL_ERROR,
  },
  MN_UNEXPECTED_CHARGE: {
    magicNumber: "-1234567.05",
    bannerText: "Unexpected invoice charge",
    statusLabel: statusLabels.STATUS_LABEL_ABOVE_THRESHOLD,
  },
};

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export class StatusLabel {
  constructor(
    public readonly statusMessage: string,
    public readonly statusClasses: string
  ) {}
}
export const STATUS_LABEL_WITHIN_THRESHOLD = new StatusLabel(
  "Within Threshold",
  "govuk-tag--green"
);
export const STATUS_LABEL_BELOW_THRESHOLD = new StatusLabel(
  "Below Threshold",
  "govuk-tag--blue"
);
export const STATUS_LABEL_ABOVE_THRESHOLD = new StatusLabel(
  "Above Threshold",
  "govuk-tag--red"
);
export const STATUS_LABEL_PENDING = new StatusLabel(
  "Pending",
  "govuk-tag--grey"
);
export const STATUS_LABEL_ERROR = new StatusLabel("Error", "govuk-tag--grey");

export class PercentageDiscrepancySpecialCase {
  constructor(
    public readonly magicNumber: string,
    public readonly bannerText: string,
    public readonly statusLabel: StatusLabel
  ) {}
}
export const MN_NO_CHARGE = new PercentageDiscrepancySpecialCase(
  "-1234567.01",
  "No charge",
  STATUS_LABEL_WITHIN_THRESHOLD
);
export const MN_RATES_MISSING = new PercentageDiscrepancySpecialCase(
  "-1234567.02",
  "Unable to find rate",
  STATUS_LABEL_ERROR
);
export const MN_INVOICE_MISSING = new PercentageDiscrepancySpecialCase(
  "-1234567.03",
  "Invoice data missing",
  STATUS_LABEL_PENDING
);
export const MN_EVENTS_MISSING = new PercentageDiscrepancySpecialCase(
  "-1234567.04",
  "Events missing",
  STATUS_LABEL_ERROR
);
export const MN_UNEXPECTED_CHARGE = new PercentageDiscrepancySpecialCase(
  "-1234567.05",
  "Unexpected invoice charge",
  STATUS_LABEL_ABOVE_THRESHOLD
);

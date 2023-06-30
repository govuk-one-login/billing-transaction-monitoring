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

export class PriceDifferencePercentageSpecialCase {
  constructor(
    public readonly magicNumber: string,
    public readonly bannerText: string
  ) {}
}

export const MN_NO_CHARGE = new PriceDifferencePercentageSpecialCase(
  "-1234567.01",
  "Unable to find rate"
);
export const MN_RATES_MISSING = new PriceDifferencePercentageSpecialCase(
  "-1234567.02",
  "Unable to find rate"
);
export const MN_INVOICE_MISSING = new PriceDifferencePercentageSpecialCase(
  "-1234567.03",
  "Invoice missing"
);
export const MN_EVENTS_MISSING = new PriceDifferencePercentageSpecialCase(
  "-1234567.04",
  "Events missing"
);
export const MN_UNEXPECTED_CHARGE = new PriceDifferencePercentageSpecialCase(
  "-1234567.05",
  "Invoice has unexpected charge"
);

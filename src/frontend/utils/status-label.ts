export type StatusLabel = {
  message: string;
  class: string;
};

export enum StatusLabels {
  withinThreshold,
  noCharge,
  belowThreshold,
  aboveThreshold,
  unexpectedCharge,
  pending,
  error,
}

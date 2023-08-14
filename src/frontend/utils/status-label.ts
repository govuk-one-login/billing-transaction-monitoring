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

export const statusLabelLookup: Record<StatusLabels, StatusLabel> = {
  [StatusLabels.withinThreshold]: {
    message: "Within Threshold",
    class: "govuk-tag--green",
  },
  [StatusLabels.noCharge]: {
    message: "No Charge",
    class: "govuk-tag--green",
  },
  [StatusLabels.belowThreshold]: {
    message: "Below Threshold",
    class: "govuk-tag--green",
  },
  [StatusLabels.aboveThreshold]: {
    message: "Above Threshold",
    class: "govuk-tag--yellow",
  },
  [StatusLabels.unexpectedCharge]: {
    message: "Unexpected Charge",
    class: "govuk-tag--yellow",
  },
  [StatusLabels.pending]: {
    message: "Pending",
    class: "govuk-tag--blue",
  },
  [StatusLabels.error]: {
    message: "Error",
    class: "govuk-tag--red",
  },
};

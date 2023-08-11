export type StatusLabel = {
  message: string;
  class: string;
};

type StatusLabels = {
  [key: string]: StatusLabel;
};

export const statusLabels: StatusLabels = {
  WITHIN_THRESHOLD: {
    message: "Within Threshold",
    class: "govuk-tag--green",
  },
  NO_CHARGE: {
    message: "No Charge",
    class: "govuk-tag--green",
  },
  BELOW_THRESHOLD: {
    message: "Below Threshold",
    class: "govuk-tag--green",
  },
  ABOVE_THRESHOLD: {
    message: "Above Threshold",
    class: "govuk-tag--yellow",
  },
  UNEXPECTED_CHARGE: {
    message: "Unexpected Charge",
    class: "govuk-tag--yellow",
  },
  PENDING: {
    message: "Pending",
    class: "govuk-tag--blue",
  },
  ERROR: {
    message: "Error",
    class: "govuk-tag--red",
  },
};

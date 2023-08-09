export type StatusLabel = {
  message: string;
  class: string;
};

export const statusLabels = {
  STATUS_LABEL_WITHIN_THRESHOLD: {
    message: "Within Threshold",
    class: "govuk-tag--green",
  },
  STATUS_LABEL_NO_CHARGE: {
    message: "No Charge",
    class: "govuk-tag--green",
  },
  STATUS_LABEL_BELOW_THRESHOLD: {
    message: "Below Threshold",
    class: "govuk-tag--blue",
  },
  STATUS_LABEL_ABOVE_THRESHOLD: {
    message: "Above Threshold",
    class: "govuk-tag--red",
  },
  STATUS_LABEL_PENDING: {
    message: "Pending",
    class: "govuk-tag--grey",
  },
  STATUS_LABEL_ERROR: {
    message: "Error",
    class: "govuk-tag--grey",
  },
};

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

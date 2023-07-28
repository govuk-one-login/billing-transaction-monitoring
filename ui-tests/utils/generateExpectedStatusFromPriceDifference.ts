import { percentageDiscrepancySpecialCase, statusLabels } from "./constants";

export const generateExpectedStatusFromPercentagePriceDifference = (
  percentageDifference: number
): string => {
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    return percentageDiscrepancySpecialCase[percentageDifference].statusLabel;
  }
  if (percentageDifference > -1 && percentageDifference < 1) {
    return statusLabels.STATUS_LABEL_WITHIN_THRESHOLD.message;
  } else {
    return percentageDifference > 1
      ? statusLabels.STATUS_LABEL_ABOVE_THRESHOLD.message
      : statusLabels.STATUS_LABEL_BELOW_THRESHOLD.message;
  }
};

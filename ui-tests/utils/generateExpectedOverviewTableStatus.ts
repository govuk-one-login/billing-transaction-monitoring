import { percentageDiscrepancySpecialCase, statusLabels } from "./constants";

export const generateExpectedOverviewTableStatusFromPercentagePriceDifference =
  (percentageDifference: number): string => {
    if (percentageDiscrepancySpecialCase[percentageDifference]) {
      return percentageDiscrepancySpecialCase[percentageDifference]
        .overviewTableStatus;
    }
    if (percentageDifference > -1 && percentageDifference < 1) {
      return percentageDiscrepancySpecialCase[percentageDifference]
        .overviewTableStatus;
    } else {
      return percentageDifference > 1
        ? statusLabels.STATUS_LABEL_ABOVE_THRESHOLD.overviewTableStatus
        : statusLabels.STATUS_LABEL_BELOW_THRESHOLD.overviewTableStatus;
    }
  };

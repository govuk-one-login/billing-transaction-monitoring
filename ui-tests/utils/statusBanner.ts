import {
  percentageDiscrepancySpecialCase,
  Color,
  InvoiceStates,
} from "./constants";

export const generateBannerDetailsFromPercentagePriceDifference = (
  percentageDifference: number
): { bannerColor: string; bannerMessage: string } => {
  let bannerColor = "";
  let bannerMessage = "";
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    bannerColor =
      percentageDiscrepancySpecialCase[percentageDifference].bannerColor;
    bannerMessage =
      percentageDiscrepancySpecialCase[percentageDifference].bannerText;
  } else if (percentageDifference >= -1 && percentageDifference <= 1) {
    bannerColor = Color.green;
    bannerMessage = InvoiceStates.invoiceWithinThreshold;
  } else if (percentageDifference > 1) {
    bannerColor = Color.red;
    bannerMessage = InvoiceStates.invoiceAboveThreshold;
  } else if (percentageDifference < -1) {
    bannerColor = Color.blue;
    bannerMessage = InvoiceStates.invoiceBelowThreshold;
  } else {
    throw new Error(`Invalid percentageDifference: ${percentageDifference}`);
  }
  return { bannerColor, bannerMessage };
};

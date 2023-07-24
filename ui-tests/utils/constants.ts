export const TEST_DATA_FILE_PATH = "../testData/testData.json";

export const percentageDiscrepancySpecialCase: Record<
  string,
  { bannerText: string; bannerColor: string; statusLabel: string }
> = {
  "-1234567.01": {
    bannerText: "No charge",
    bannerColor: "#1d70b8", // blue
    statusLabel: "WITHIN THRESHOLD",
  },
  "-1234567.02": {
    bannerText: "Unable to find rate",
    bannerColor: "#b1b4b6", // grey
    statusLabel: "ERROR",
  },
  "-1234567.03": {
    bannerText: "Invoice data missing",
    bannerColor: "#b1b4b6", // grey
    statusLabel: "PENDING",
  },
  "-1234567.04": {
    bannerText: "Events missing",
    bannerColor: "#b1b4b6", // grey
    statusLabel: "ERROR",
  },
  "-1234567.05": {
    bannerText: "Unexpected invoice charge",
    bannerColor: "#b1b4b6", // grey
    statusLabel: "ABOVE THRESHOLD",
  },

  "-100.0": {
    bannerText: "Invoice below threshold",
    bannerColor: "#1d70b8", // blue
    statusLabel: "BELOW THRESHOLD",
  },
};

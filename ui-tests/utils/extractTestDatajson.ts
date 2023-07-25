import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import {
  percentageDiscrepancySpecialCase,
  TEST_DATA_FILE_PATH,
} from "./constants";

export type FullExtractData = {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: number;
  contract_name: string;
  year: string;
  month: string;
  billing_unit_price: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: number;
};

export const getTestDataFilePath = (): string => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const testDataFilePath = path.join(currentDirPath, TEST_DATA_FILE_PATH);
  return testDataFilePath;
};

export const readJsonDataFromFile = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return fileContent;
};

export const getExtractDataFromJson = (
  filePath: string
): { data: FullExtractData[]; content: string } => {
  const jsonArray =
    "[" + readJsonDataFromFile(filePath).replace(/\n/g, ",") + "]";
  const json: FullExtractData[] = JSON.parse(jsonArray);
  return { data: json, content: jsonArray };
};

export const getUniqueVendorNamesFromJson = (filePath: string): string[] => {
  const { data } = getExtractDataFromJson(filePath);
  const vendorNames = data.map((obj) => obj.vendor_name);
  const uniqueVendorNames = [...new Set(vendorNames)];
  return uniqueVendorNames;
};

export const getUniqueContractIdsFromJson = (filePath: string): number[] => {
  const { data } = getExtractDataFromJson(filePath);
  const contractIds = data.map((obj) => obj.contract_id);
  const uniqueContractIds = [...new Set(contractIds)];
  return uniqueContractIds;
};

export const getUniqueInvoiceMonthsYearsByVendorCount = (
  vendorName: string
): number => {
  const testDataFilePath = getTestDataFilePath();
  const { data } = getExtractDataFromJson(testDataFilePath);
  const uniqueMonthYears = new Set();
  for (const invoice of data) {
    if (invoice.vendor_name === vendorName) {
      const monthYear = `${invoice.year}-${invoice.month}`;
      uniqueMonthYears.add(monthYear);
    }
  }
  return uniqueMonthYears.size;
};

export const getUniqueInvoiceMonthsYearsByVendor = (
  vendorName: string
): Set<string> => {
  const testDataFilePath = getTestDataFilePath();
  const { data } = getExtractDataFromJson(testDataFilePath);
  const uniqueMonthYears = new Set<string>();
  for (const invoice of data) {
    if (invoice.vendor_name === vendorName) {
      const monthYear = `${invoice.year}-${invoice.month}`;
      uniqueMonthYears.add(monthYear);
    }
  }
  return uniqueMonthYears;
};

export const getUniqueVendorIdsFromJson = (vendorName: string): string[] => {
  const testDataFilePath = getTestDataFilePath();
  const { data } = getExtractDataFromJson(testDataFilePath);
  const uniqueVendorIds = new Set<string>();
  for (const item of data) {
    if (item.vendor_name === vendorName) {
      uniqueVendorIds.add(item.vendor_id);
    }
  }
  if (uniqueVendorIds.size === 0) {
    throw new Error(`Vendor data not found for :${vendorName}`);
  }
  return Array.from(uniqueVendorIds);
};

export const getPriceDifferencePercentageFromJson = (
  year: string,
  month: string
): number => {
  const testDataFilePath = getTestDataFilePath();
  const { data } = getExtractDataFromJson(testDataFilePath);
  const invoice = data.find(
    (entry) => entry.year === year && entry.month === month
  );
  if (invoice) {
    console.log(invoice.price_difference_percentage);
    return invoice.price_difference_percentage;
  }
  throw new Error(
    `price difference percentage not found for year: ${year} and month ${month}`
  );
};

export const getBannerColorFromPercentagePriceDifference = (
  percentageDifference: number
): string => {
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    console.log(
      "INSIDE FIRST CHECK LOOP:",
      percentageDiscrepancySpecialCase[percentageDifference]
    );
    return percentageDiscrepancySpecialCase[percentageDifference].bannerColor;
  }
  if (percentageDifference >= -1 && percentageDifference <= 1) {
    return "#00703c"; // green
  } else if (percentageDifference > 1) {
    return "#d4351c"; // red
  } else if (percentageDifference < -1) {
    return "#1d70b8"; // blue
  }
  throw new Error(`Invalid percentageDifference: ${percentageDifference}`);
};

export const getBannerMessageFromPercentagePriceDifference = (
  percentageDifference: number
): string => {
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    return percentageDiscrepancySpecialCase[percentageDifference].bannerText;
  }
  if (percentageDifference >= -1 && percentageDifference <= 1) {
    return "Invoice within threshold";
  } else if (percentageDifference > 1) {
    return "Invoice above threshold";
  } else if (percentageDifference < -1) {
    return "Invoice below threshold";
  }
  throw new Error(`Invalid percentageDifference: ${percentageDifference}`);
};

export const formatPercentageDifference = (
  percentageDifference: number
): string => {
  const formattedPercentage = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 4,
  }).format(percentageDifference / 100);
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    return percentageDiscrepancySpecialCase[percentageDifference].bannerText;
  }
  if (percentageDifference >= -1 && percentageDifference <= 1) {
    return formattedPercentage; // green
  } else if (percentageDifference > 1) {
    return formattedPercentage;
  }
  throw new Error(`Invalid percentageDifference: ${percentageDifference}`);
};

export const getStatusFromPercentagePriceDifference = (
  percentageDifference: number
): string => {
  if (percentageDiscrepancySpecialCase[percentageDifference]) {
    return percentageDiscrepancySpecialCase[percentageDifference].statusLabel;
  }
  if (percentageDifference >= -1 && percentageDifference <= 1) {
    return "WITHIN THRESHOLD"; // green
  } else if (percentageDifference > 1) {
    return "ABOVE THRESHOLD"; // red
  } else if (percentageDifference < -1) {
    return "BELOW THRESHOLD"; // blue
  } else {
    return "NO FOUND";
  }
};

export const getItemsByContractIdYearMonth = async (
  contractId: number,
  year: string,
  month: string
): Promise<FullExtractData[]> => {
  const testDataFilePath = getTestDataFilePath();
  const { data } = getExtractDataFromJson(testDataFilePath);
  return data
    .filter(
      (row) =>
        row.contract_id === contractId &&
        row.year === year &&
        row.month === month
    )
    .map(formatInvoiceData);
};

const formatInvoiceData = (row: FullExtractData): FullExtractData => {
  if (row.billing_quantity === "") {
    return {
      ...row,
      billing_quantity: "Invoice data missing",
      billing_price_formatted: "Invoice data missing",
      billing_amount_with_tax: "Invoice data missing",
      billing_unit_price: "Invoice data missing",
    };
  }
  if (row.transaction_quantity === "") {
    return {
      ...row,
      transaction_quantity: "Events missing",
      transaction_price_formatted: "Events missing",
    };
  }
  return row;
};

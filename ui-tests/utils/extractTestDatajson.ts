import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { formatInvoiceDataFromJson } from "./invoiceDataFormatters";
import { TEST_DATA_FILE_PATH } from "./constants";

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

export const getExtractDataFromJson = (filePath: string): FullExtractData[] => {
  const jsonArray =
    "[" + readJsonDataFromFile(filePath).replace(/\n/g, ",") + "]";
  const json: FullExtractData[] = JSON.parse(jsonArray);
  return json;
};

export const getUniqueVendorNamesFromJson = (filePath: string): string[] => {
  const data = getExtractDataFromJson(filePath);
  const vendorNames = data.map((obj) => obj.vendor_name);
  const uniqueVendorNames = [...new Set(vendorNames)];
  return uniqueVendorNames;
};

export const getUniqueContractIdsFromJson = (filePath: string): number[] => {
  const data = getExtractDataFromJson(filePath);
  const contractIds = data.map((obj) => obj.contract_id);
  const uniqueContractIds = [...new Set(contractIds)];
  return uniqueContractIds;
};

export const getUniqueInvoiceMonthsYearsByVendor = (
  vendorName: string
): { count: number; monthYears: Set<string> } => {
  const testDataFilePath = getTestDataFilePath();
  const data = getExtractDataFromJson(testDataFilePath);
  const uniqueMonthYears = new Set<string>();
  for (const invoice of data) {
    if (invoice.vendor_name === vendorName) {
      const monthYear = `${invoice.year}-${invoice.month}`;
      uniqueMonthYears.add(monthYear);
    }
  }
  return { count: uniqueMonthYears.size, monthYears: uniqueMonthYears };
};

export const getUniqueVendorIdsFromJson = (vendorName: string): string[] => {
  const testDataFilePath = getTestDataFilePath();
  const data = getExtractDataFromJson(testDataFilePath);
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
  vendor: string,
  year: string,
  month: string
): number => {
  const testDataFilePath = getTestDataFilePath();
  const data = getExtractDataFromJson(testDataFilePath);
  const invoice = data.find(
    (entry) =>
      entry.vendor_name === vendor &&
      entry.year === year &&
      entry.month === month
  );
  if (invoice) {
    return invoice.price_difference_percentage;
  }
  throw new Error(
    `price difference percentage not found for year: ${year} and month ${month}`
  );
};

export const getInvoicesByContractIdYearMonth = async (
  contractId: number,
  year: string,
  month: string
): Promise<FullExtractData[]> => {
  const testDataFilePath = getTestDataFilePath();
  const data = getExtractDataFromJson(testDataFilePath);
  return data
    .filter(
      (row) =>
        row.contract_id === contractId &&
        row.year === year &&
        row.month === month
    )
    .map(formatInvoiceDataFromJson);
};

import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { formatInvoiceDataFromJson } from "./invoiceDataFormatters";
import { TEST_DATA_FILE_PATH } from "./constants";

export type FullExtractData = {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: string;
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
  price_difference_percentage: string;
  invoice_is_quarterly: string;
};

const cachedFileTextByPath: Partial<Record<string, string>> = {};

export const getTestDataFilePath = (): string => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const testDataFilePath = path.join(currentDirPath, TEST_DATA_FILE_PATH);
  return testDataFilePath;
};

export const readJsonDataFromFile = (filePath: string): string => {
  const cachedData = cachedFileTextByPath[filePath];
  if (cachedData) return cachedData;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  cachedFileTextByPath[filePath] = fileContent;
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

export const getUniqueContractIdsFromJson = (filePath: string): string[] => {
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
    return parseFloat(invoice.price_difference_percentage);
  }
  throw new Error(
    `price difference percentage not found for year: ${year} and month ${month}`
  );
};

export const getInvoicesByContractIdYearMonth = (
  contractId: string,
  year: string,
  month: string
): FullExtractData[] => {
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

export const extractAllUniqueVendorInvoiceDataFomJson = (
  testDataFilepath: string
): Array<{
  vendor: string;
  year: string;
  month: string;
  vendorId: string;
  invoiceIsQuarterly: boolean;
}> => {
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilepath);
  const allVendorInvoiceData = [];

  for (const vendor of vendorsNameFromJson) {
    const { monthYears } = getUniqueInvoiceMonthsYearsByVendor(vendor);
    const uniqueYearsMonths = Array.from(monthYears);

    for (const monthYear of uniqueYearsMonths) {
      const [year, month] = monthYear.split("-");
      const vendorIds = getUniqueVendorIdsFromJson(vendor);

      for (const vendorId of vendorIds) {
        allVendorInvoiceData.push({
          vendor,
          year,
          month,
          vendorId,
          invoiceIsQuarterly: invoiceIsQuarterly({ vendorId, year, month }),
        });
      }
    }
  }
  return allVendorInvoiceData;
};

export const getLatestInvoicePerVendor = (): FullExtractData[] => {
  const testDataFilePath = getTestDataFilePath();
  const data = getExtractDataFromJson(testDataFilePath);

  // sort data by vendor year and month
  const sortedData = [...data].sort((a, b) => {
    if (a.vendor_name !== b.vendor_name)
      return a.vendor_name.localeCompare(b.vendor_name);
    if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
    return parseInt(b.month) - parseInt(a.month);
  });

  // Filter latest invoice
  const latestInvoices: FullExtractData[] = [];
  let currentVendor = "";
  for (const invoice of sortedData) {
    if (invoice.vendor_name !== currentVendor) {
      latestInvoices.push(invoice);
      currentVendor = invoice.vendor_name;
    }
  }
  return latestInvoices;
};

const invoiceIsQuarterly = ({
  vendorId,
  year,
  month,
}: {
  vendorId: string;
  year: string;
  month: string;
}): boolean => {
  const testDataFilePath = getTestDataFilePath();
  const rows = getExtractDataFromJson(testDataFilePath);

  const row = rows.find(
    (row) =>
      row.vendor_id === vendorId && row.month === month && row.year === year
  );

  return row ? row.invoice_is_quarterly === "true" : false;
};

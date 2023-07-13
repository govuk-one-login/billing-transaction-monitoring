import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

type FullExtractData = {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: number;
  contract_name: string;
  year: number;
  month: number;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: string;
};

export const getExtractDataFromJson = (
  filePath: string
): { data: FullExtractData[]; content: string } => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const jsonArray = "[" + fileContent.replace(/\n/g, ",") + "]";
  const json: FullExtractData[] = JSON.parse(jsonArray);
  return { data: json, content: fileContent };
};

export const getUniqueVendorNamesFromJson = (filePath: string): string[] => {
  const { data } = getExtractDataFromJson(filePath);
  const vendorNames = data.map((obj) => obj.vendor_name);
  const uniqueVendorNames = [...new Set(vendorNames)];
  return uniqueVendorNames;
};

export const getUniqueInvoiceMonthsYearsByVendor = (
  vendorName: string
): number => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const testDataFilePath = path.join(
    currentDirPath,
    "../testData/testData.json"
  );
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

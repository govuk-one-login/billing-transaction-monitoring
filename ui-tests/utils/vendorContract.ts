import {
  getExtractDataFromJson,
  getTestDataFilePath,
} from "./extractTestDatajson";

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

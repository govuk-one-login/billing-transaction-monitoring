import { getDashboardExtract } from "./get-dashboard-extract";
import { FullExtractLineItem } from "./types";

export const getLineItems = async (
  contractId: string,
  year: string,
  month: string | number,
  invoiceIsQuarterly: boolean = false
): Promise<FullExtractLineItem[]> => {
  const dashboardData = await getDashboardExtract();
  const monthNumber = typeof month === "number" ? month : parseInt(month, 10);
  return dashboardData.filter(
    (row) =>
      row.contract_id === contractId &&
      row.year === year &&
      parseInt(row.month, 10) === monthNumber &&
      (invoiceIsQuarterly
        ? row.invoice_is_quarterly === "true"
        : row.invoice_is_quarterly !== "true")
  );
};

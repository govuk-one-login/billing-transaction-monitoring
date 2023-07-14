import { getDashboardExtract } from "./get-dashboard-extract";
import { FullExtractLineItem } from "./types";

export const getLineItems = async (
  contractId: string,
  year: string,
  month: string
): Promise<FullExtractLineItem[]> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData.filter(
    (row) =>
      row.contract_id === contractId && row.year === year && row.month === month
  );
};

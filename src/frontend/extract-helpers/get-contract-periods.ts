import { MONTHS } from "../utils";
import { getDashboardExtract } from "./get-dashboard-extract";

export const getContractPeriods = async (
  contractId: string
): Promise<Array<{ month: string; year: string; prettyMonth: string }>> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData
    .filter((row) => row.contract_id === contractId)
    .map((row) => ({
      year: row.year,
      month: row.month,
      prettyMonth: MONTHS[Number(row.month) - 1],
    }))
    .filter(
      (row, i, rows) =>
        rows.findIndex((r) => r.month === row.month && r.year === row.year) ===
        i
    ) // removes duplicates
    .sort((a, b) => {
      if (a.year === b.year) {
        return +a.month - +b.month;
      } else {
        return +a.year - +b.year;
      }
    });
};

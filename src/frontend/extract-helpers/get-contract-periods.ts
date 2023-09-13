import { MONTHS } from "../utils";
import { getDashboardExtract } from "../../shared/utils/config-utils/get-dashboard-extract";

export type Period = {
  month: string;
  year: string;
  prettyMonth: string;
  isQuarter: boolean;
};

export const getContractPeriods = async (
  contractId: string
): Promise<Period[]> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData
    .filter((row) => row.contract_id === contractId)
    .map((row) => ({
      year: row.year,
      month: row.month,
      prettyMonth: MONTHS[Number(row.month) - 1],
      isQuarter: row.invoice_is_quarterly === "true",
    }))
    .filter(
      (row, i, rows) =>
        rows.findIndex(
          (r) =>
            r.year === row.year &&
            r.month === row.month &&
            r.isQuarter === row.isQuarter
        ) === i
    ) // removes duplicates
    .sort((a, b) => {
      if (a.year === b.year) {
        return +a.month - +b.month;
      } else {
        return +a.year - +b.year;
      }
    });
};

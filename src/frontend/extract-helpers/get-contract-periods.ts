import { MONTHS } from "../utils";
import { getDashboardExtract } from "./get-dashboard-extract";

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
  console.log("dashboardData:", dashboardData);
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
        return (
          (a.isQuarter ? getQuarterlyComparisonValue(+a.month) : +a.month) -
          (b.isQuarter ? getQuarterlyComparisonValue(+b.month) : +b.month)
        );
      } else {
        return +a.year - +b.year;
      }
    });
};

// Subtract 0.1 from first month in quarter, so quarters are just before their first month when sorted
const getQuarterlyComparisonValue = (firstMonthInQuarter: number): number =>
  firstMonthInQuarter - 0.1;

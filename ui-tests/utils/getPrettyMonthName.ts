export const prettyMonthName = (monthNumber: string): string => {
  const date = new Date(0, parseInt(monthNumber) - 1);
  const monthName = date.toLocaleString("default", { month: "short" });
  return monthName;
};

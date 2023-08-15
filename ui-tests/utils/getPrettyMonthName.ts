export const prettyMonthName = (monthNumber: string): string => {
  const date = new Date(0, parseInt(monthNumber) - 1);
  const monthName = date.toLocaleString("default", { month: "short" });
  return monthName;
};

export const quarterName = (monthNumber: string): string => {
  if (monthNumber === "01") return "Q4";
  if (monthNumber === "04") return "Q1";
  if (monthNumber === "07") return "Q2";
  if (monthNumber === "09") return "Q3";
  throw Error(`Invalid month: ${monthNumber}`);
};

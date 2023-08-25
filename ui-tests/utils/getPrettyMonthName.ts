export const prettyMonthName = (monthNumber: string): string => {
  const date = new Date(0, parseInt(monthNumber) - 1);
  const monthName = date.toLocaleString("default", { month: "short" });
  return monthName;
};

export const quarterName = (monthNumberText: string): string => {
  if (monthNumberText === "01") return "Q4";
  if (monthNumberText === "04") return "Q1";
  if (monthNumberText === "07") return "Q2";
  if (monthNumberText === "10") return "Q3";
  throw Error(`Invalid month: ${monthNumberText}`);
};

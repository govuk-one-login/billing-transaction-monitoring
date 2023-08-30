import { CsvColumnValue, ParserOptions } from "./types";

export const parseConfigCell = (
  cell: string | number,
  options: ParserOptions
): CsvColumnValue => {
  if (cell === "") {
    if (options.required) throw new Error("Missing required data");
    return undefined;
  }

  switch (options.type) {
    case "boolean":
      return cell === "true";

    case "date": {
      const date = new Date(cell);

      if (date.toString() === "Invalid Date") throw new Error("Invalid date");

      return date;
    }

    case "number": {
      const number = typeof cell === "number" ? cell : parseInt(cell, 10);
      if (Number.isNaN(number)) throw new Error("Invalid number");
      return number;
    }

    case "string":
      return cell;
  }
};

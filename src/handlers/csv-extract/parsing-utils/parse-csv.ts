const isKvpRow = (row: string[]): boolean => {
  return (
    !!row[0] &&
    !!row[1] &&
    row.every((cell, i) => {
      if (i <= 1) return true;
      return !cell;
    })
  );
};

const isFullRow = (row: string[]): boolean => {
  return (
    row !== undefined &&
    row.length > 0 &&
    row.every((cell) => {
      return cell;
    })
  );
};

const isTotalRow = (row: string[]): boolean => {
  return row[0] === "Total";
};

const objectifyLineItemRow = (
  tableHeader: string[],
  row: string[]
): Record<string, string> => {
  return tableHeader.reduce(
    (acc, heading, j) => ({
      ...acc,
      [heading]: row[j],
    }),
    {}
  );
};

const applyStructure = (
  cells: string[][]
): {
  kvps: Record<string, string>;
  lineItems: Array<Record<string, string>>;
} => {
  let tableHeader: string[] | null = null;
  return cells.reduce(
    (acc, row) => {
      if (isKvpRow(row)) {
        return {
          ...acc,
          kvps: { ...acc.kvps, [row[0]]: row[1] },
        };
      }
      if (isFullRow(row) && !tableHeader) {
        tableHeader = row;
        return acc;
      }
      if (isTotalRow(row)) {
        return acc;
      }
      if (isFullRow(row)) {
        if (!tableHeader) {
          throw new Error("Encountered a line item before finding a header.");
        }
        const lineItem = objectifyLineItemRow(tableHeader, row);
        return {
          ...acc,
          lineItems: [...acc.lineItems, lineItem],
        };
      }
      return acc;
    },
    {
      kvps: {},
      lineItems: [] as Array<Record<string, string>>,
    }
  );
};

export const parseCsv = (csv: string): object => {
  const newLineDelimiter = csv.search("\r\n") !== -1 ? "\r\n" : "\n";
  const rows = csv.split(newLineDelimiter);
  const cells = rows.map((row) => row.split(",").slice(0, -1));
  const { kvps, lineItems } = applyStructure(cells);
  return { ...kvps, lineItems };
};

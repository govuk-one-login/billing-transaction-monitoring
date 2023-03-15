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
  return row !== undefined && row.length > 2;
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

const trimTrailingBlankColumns = (row: string[]): string[] => {
  let trimmedRow = row;
  while (trimmedRow.length > 0 && !trimmedRow[trimmedRow.length - 1]) {
    trimmedRow = trimmedRow.slice(0, -1);
  }
  return trimmedRow;
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
      if (isTotalRow(row)) {
        return acc;
      }
      const trimmedRow = trimTrailingBlankColumns(row);
      if (isFullRow(trimmedRow)) {
        if (!tableHeader) {
          tableHeader = trimmedRow;
          return acc;
        }
        if (trimmedRow.length !== tableHeader.length) {
          throw new Error("Wrong number of columns in line item");
        }
        const lineItem = objectifyLineItemRow(tableHeader, trimmedRow);
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
  const rows = csv.split(/\r?\n/);
  const cells = rows.map((row) => row.split(","));
  const { kvps, lineItems } = applyStructure(cells);
  return { ...kvps, lineItems };
};

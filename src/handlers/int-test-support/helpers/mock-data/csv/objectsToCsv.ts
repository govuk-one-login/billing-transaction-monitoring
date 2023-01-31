interface ObjectsToCSVOptions {
  filterKeys?: string[]; // a list of keys to be filtered out of the output csv
  renameKeys?: Map<string, string>; // a dictionary of keys to be renamed
}
type ObjectsToCSV = (
  objects: Array<Record<string, string | number>>,
  options?: ObjectsToCSVOptions
) => string;

export const objectsToCSV: ObjectsToCSV = (objects, options) => {
  // Filter objects with given keys
  if (options?.filterKeys !== undefined) {
    filterKeys(objects, options?.filterKeys);
  }

  // Set up header row
  const csvData = [];
  const headerRow = Array.from(new Set(objects.map(Object.keys).flat()));

  // Rename header row items with given dictionary
  if (options?.renameKeys !== undefined) {
    csvData.push(renameHeaderKeys(headerRow, options?.renameKeys));
  } else {
    csvData.push(headerRow);
  }

  // Build CSV String
  for (let i = 0; i < objects.length; i++) {
    const row = [];
    for (let j = 0; j < headerRow.length; j++) {
      row.push(objects[i][headerRow[j]]);
    }
    csvData.push(row);
  }
  return csvData.map((e) => e.join(",")).join("\n");
};

function filterKeys(
  objects: Array<Record<string, string | number>>,
  keysToFilter: string[]
): void {
  keysToFilter.forEach((keyToFilter) =>
    objects.map((object) => {
      for (const key in object) {
        if (key.match(keyToFilter) != null) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete object[key];
        }
      }
      return object;
    })
  );
}

function renameHeaderKeys(
  headerRow: string[],
  renameKeys: Map<string, string>
): string[] {
  const renamedHeaderRow: string[] = [];
  for (let i = 0; i < headerRow.length; i++) {
    if (renameKeys.get(headerRow[i]) === undefined) {
      renamedHeaderRow.push(headerRow[i]);
    } else {
      renamedHeaderRow.push(renameKeys.get(headerRow[i]) as string);
    }
  }
  return renamedHeaderRow;
}

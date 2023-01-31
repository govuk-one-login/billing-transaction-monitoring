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

  const filteredObjects = redactKeys(objects, options?.filterKeys);
  // Set up header row
  const csvData = [];
  const headerRow = Array.from(
    new Set(filteredObjects.map(Object.keys).flat())
  );

  // Rename header row items with given dictionary
  if (options?.renameKeys !== undefined) {
    csvData.push(renameHeaderKeys(headerRow, options?.renameKeys));
  } else {
    csvData.push(headerRow);
  }

  // Build CSV String
  for (let i = 0; i < filteredObjects.length; i++) {
    const row = [];
    for (let j = 0; j < headerRow.length; j++) {
      row.push(filteredObjects[i][headerRow[j]]);
    }
    csvData.push(row);
  }
  return csvData.map((e) => e.join(",")).join("\n");
};

const redactKeys = (
  objects: Array<Record<string, string | number>>,
  filterKeys: string[] = []
): Array<Record<string, string | number>> => {
  return objects.reduce<Array<Record<string, string | number>>>(
    (filteredObjects, currentObject) => [
      ...filteredObjects,
      {
        ...Object.entries(currentObject).reduce(
          (filteredObject, [key, value]) => {
            if (filterKeys.includes(key)) return filteredObject;
            return {
              ...filteredObject,
              [key]: value,
            };
          },
          {}
        ),
      },
    ],
    []
  );
};

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

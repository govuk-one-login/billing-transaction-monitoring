interface ObjectsToCSVOptions {
  filterKeys?: string[]; // a list of keys to be filtered out of the output csv
  renameKeys?: Map<string, string>; // a dictionary of keys to be renamed
}
type ObjectsToCSV = (
  objects: Array<Record<string, string | number>>,
  options?: ObjectsToCSVOptions
) => string;

export const objectsToCSV: ObjectsToCSV = (
  objects,
  { filterKeys = [], renameKeys = new Map() } = {
    filterKeys: [],
    renameKeys: new Map(),
  }
) => {
  // Filter objects with given keys
  const filteredObjects = redactKeys(objects, filterKeys);

  // Set up header row
  const csvData = [];
  const headerRow = Array.from(
    new Set(filteredObjects.map(Object.keys).flat())
  );

  // Rename header row items with given dictionary
  csvData.push(renameHeaderKeys(headerRow, renameKeys));

  // Build CSV String
  for (const object of filteredObjects) {
    const row = [];
    for (const header of headerRow) {
      row.push(`${object[header]}`);
    }
    csvData.push(row);
  }
  return csvData.map((e) => e.join(",")).join("\n");
};

const redactKeys = (
  objects: Array<Record<string, string | number>>,
  filterKeys: string[]
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

const renameHeaderKeys = (
  headerRow: string[],
  renameKeys: Map<string, string>
): string[] => {
  return headerRow.map((header) => {
    if (renameKeys.has(header)) return renameKeys.get(header) as string;
    return header;
  });
};

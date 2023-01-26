interface ObjectsToCSVOptions {
  filterKeys?: string[]; // a list of keys to be filtered out of the output csv
  renameKeys?: Map<string, string>; // a dictionary of keys to be renamed
}
type ObjectsToCSV = (
  objects: Array<Record<string, string | number>>,
  options?: ObjectsToCSVOptions
) => string;

export const objectsToCSV: ObjectsToCSV = (objects, options) => {
  if (options?.filterKeys !== undefined) {
    options?.filterKeys.forEach((filterKey) =>
      objects.map((object) => {
        for (const key in object) {
          if (key.match(filterKey) != null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete object[key];
          }
        }
        return object;
      })
    );
  }

  if (options?.renameKeys !== undefined) {
    for (const [renameKey, renameValue] of options.renameKeys.entries()) {
      console.log("1", renameKey);
      console.log("2", renameValue);
      objects.map((object) => {
        console.log("3", object);
        for (const key in object) {
          console.log("4", key);
          if (key === renameKey) {
            object[renameValue] = object[key];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete object[key];
          }
        }
        console.log("5", object);
        return object;
      });
    }
  }

  const csvString = [];
  const headerRow = [
    ...new Set(objects.map((object) => Object.keys(object)).flat()),
  ];
  csvString.push(headerRow);
  for (let i = 0; i < objects.length; i++) {
    const row = [];
    for (let j = 0; j < headerRow.length; j++) {
      row.push(objects[i][headerRow[j]]);
    }
    csvString.push(row);
  }
  console.log(csvString);
  return csvString.map((e) => e.join(",")).join("\n");
};

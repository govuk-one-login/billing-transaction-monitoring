interface ObjectsToCSVOptions {
  filterKeys?: string[]; // a list of keys to be filtered out of the output csv
  renameKeys?: Map<string, string>; // a dictionary of keys to be renamed
}
type ObjectsToCSV = (
  objects: Array<Record<string, string | number>>,
  options?: ObjectsToCSVOptions
) => string;

export const objectsToCSV: ObjectsToCSV = (objects, options) => {
  const csv = objects.map((object) => Object.keys(object));
  console.log(csv);
  console.log(new Set(csv.flat()));
  csv.unshift(Object.keys(objects[0]));

  return csv.join("\n");
};

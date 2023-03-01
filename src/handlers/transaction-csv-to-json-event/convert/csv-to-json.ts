import csvToJsonLib from "csvtojson";

type CsvToJson = <TObject>(
  csv: string,
  renamingMap: Map<string, string>
) => Promise<TObject[]>;

export const csvToJson: CsvToJson = async (csv, renamingMap) => {
  const firstNewLinePosition = csv.match(/\r\n|\r|\n/)?.index;

  if (firstNewLinePosition === undefined)
    throw new Error("No new lines found in the given CSV");

  const headerRow = csv.slice(0, firstNewLinePosition);
  const originalColumnNames = headerRow.split(",");
  const renamedColumnNames = originalColumnNames.map((originalName) =>
    renamingMap.has(originalName) ? renamingMap.get(originalName) : originalName
  );
  const renamedHeaderRow = renamedColumnNames.join(",");
  const renamedCsv = renamedHeaderRow + csv.slice(firstNewLinePosition);

  return await csvToJsonLib().fromString(renamedCsv);
};

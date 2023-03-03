import csvToJsonLib from "csvtojson";

type CsvToJson = <TObject>(
  csv: string,
  renamingConfig: Array<[string, string]>
) => Promise<TObject[]>;

export const csvToJson: CsvToJson = async (csv, renamingConfig) => {
  const firstNewLinePosition = csv.match(/\r\n|\r|\n/)?.index;

  if (firstNewLinePosition === undefined)
    throw new Error("No new lines found in the given CSV");

  const headerRow = csv.slice(0, firstNewLinePosition);
  const originalColumnNames = headerRow.split(",");
  const renamingMap = new Map(renamingConfig);
  const renamedColumnNames = originalColumnNames.map((originalName) =>
    renamingMap.get(originalName) ?? originalName
  );
  const renamedHeaderRow = renamedColumnNames.join(",");
  const renamedCsv = renamedHeaderRow + csv.slice(firstNewLinePosition);

  return await csvToJsonLib().fromString(renamedCsv);
};

export const isValidRenamingConfig = (
  renamingConfig: any
): renamingConfig is Array<[string, string]> => {
  return (
    Array.isArray(renamingConfig) &&
    renamingConfig.every(
      (currentValue) =>
        Array.isArray(currentValue) &&
        currentValue.every((item) => typeof item === "string") &&
        currentValue.length === 2
    )
  );
};

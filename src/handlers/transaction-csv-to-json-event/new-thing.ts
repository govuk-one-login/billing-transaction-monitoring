import csvToJson from "csvtojson";

type Convert = <TObject>(
  csv: string,
  renamingMap: Map<string, string>
) => Promise<TObject[]>;

export const convert: Convert = async (csv, renamingMap) => {
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

  return await csvToJson().fromString(renamedCsv);
};

export type InferenceRules<TObject> = Array<{
  given: Partial<TObject>;
  inferValue: unknown;
}>;

export interface Inference<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> {
  field: keyof TFields;
  rules: InferenceRules<TObject>;
  defaultValue: unknown;
}

export type Inferences<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> = Array<Inference<TObject, TFields>>;

type Infer = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  array: TObject[],
  inferences: Inferences<TObject, TFields>
) => Array<TObject & TFields>;

export const infer: Infer = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  array: TObject[],
  inferences: Array<Inference<TObject, TFields>>
): Array<TObject & TFields> => {
  return array.map((entry) => {
    return inferences.reduce<TObject & TFields>(
      (augmentedEntry: any, { field, rules, defaultValue }) => {
        const value = rules.reduce((inferredValue, rule) => {
          const isMatch = Object.entries(rule.given).every(([key, value]) => {
            return entry[key] === value;
          });
          return isMatch ? rule.inferValue : inferredValue;
        }, defaultValue);
        return {
          ...augmentedEntry,
          [field]: value,
        };
      },
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
      entry as TObject & TFields
    );
  });
};

export interface CsvOptions<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> {
  renamingMap: Map<string, string>; // renaming header row
  inferences: Array<Inference<TObject, TFields>>; // rules to infer additional fields
}

export const orchestrate = async <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  csv: string,
  options: CsvOptions<TObject, TFields>
): Promise<Array<TObject & TFields>> => {
  const originalObjects = await convert<TObject>(csv, options.renamingMap);

  return infer(originalObjects, options.inferences);
};

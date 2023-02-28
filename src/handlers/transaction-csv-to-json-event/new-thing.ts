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
  entries: TObject[],
  inferences: Inferences<TObject, TFields>
) => Array<TObject & TFields>;

export const infer: Infer = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  entries: TObject[],
  inferences: Array<Inference<TObject, TFields>>
): Array<TObject & TFields> => {
  return entries.map((entry) => {
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

export enum Operations {
  add = "add",
  multiply = "multiply",
  exponentiate = "exponentiate",
  floor = "floor",
  ceil = "ceil",
  construct = "construct",
}

export enum Constructables {
  date = "date",
  number = "number",
}

interface Transformation<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> {
  inputKey: keyof TObject;
  outputKey: keyof TFields;
  condition: RegExp;
  operations: Array<{
    operation: Operations;
    parameter?: number | Constructables;
  }>;
}

export type Transformations<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> = Array<Transformation<TObject, TFields>>;

type InteroperablyTransformable = string | number | Date;

const constructablesDict = {
  [Constructables.date]: (input: InteroperablyTransformable) => new Date(input),
  [Constructables.number]: (input: InteroperablyTransformable) =>
    Number(input).valueOf(),
};

const operationsDict: Record<
  Operations,
  (
    input: InteroperablyTransformable,
    parameter?: string | number
  ) => string | number | Date
> = {
  [Operations.add]: (input, parameter) => {
    if (typeof parameter !== "number") {
      throw new Error("Invalid parameter");
    }
    if (input instanceof Date) {
      return input.getTime() + parameter;
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return input + parameter;
  },
  [Operations.multiply]: (input, parameter) => {
    if (typeof parameter !== "number") {
      throw new Error("Invalid parameter");
    }
    if (input instanceof Date) {
      return input.getTime() * parameter;
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return input * parameter;
  },
  [Operations.exponentiate]: (input, parameter) => {
    if (typeof parameter !== "number") {
      throw new Error("Invalid parameter");
    }
    if (input instanceof Date) {
      return input.getTime() ** parameter;
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return input ** parameter;
  },
  [Operations.floor]: (input) => {
    if (input instanceof Date) {
      return input.getTime();
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return Math.floor(input);
  },
  [Operations.ceil]: (input) => {
    if (input instanceof Date) {
      return input.getTime();
    }
    if (typeof input !== "number") {
      throw new Error("Invalid input");
    }
    return Math.ceil(input);
  },
  [Operations.construct]: (input, parameter) => {
    if (
      !parameter ||
      typeof parameter !== "string" ||
      !(parameter in Constructables)
    )
      throw new Error("Invalid parameter");
    return constructablesDict[parameter as Constructables](input);
  },
};

const shouldOperate = <TObject extends Record<string, unknown>>(
  value: TObject[keyof TObject],
  condition: RegExp
): boolean => !!String(value).match(condition);

const operate = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  entry: TObject,
  {
    inputKey,
    outputKey,
    condition,
    operations,
  }: Transformation<TObject, TFields>
): TObject & { [outputKey: string]: InteroperablyTransformable } => {
  const inputValue = entry[inputKey] as unknown as InteroperablyTransformable;
  if (!shouldOperate(entry[inputKey], condition)) {
    return {
      ...entry,
      [outputKey]: inputValue,
    };
  }

  let outputValueV2: InteroperablyTransformable = inputValue;
  for (const { operation, parameter } of operations) {
    outputValueV2 = operationsDict[operation](outputValueV2, parameter);
  }

  // const outputValue = operations.reduce<InteroperablyTransformable>(
  //   (transformedValue, { operation, parameter }) => {
  //     return operationsDict[operation](transformedValue, parameter);
  //   },
  //   inputValue
  // );
  return {
    ...entry,
    [outputKey]: outputValueV2,
  };
};

export const transform = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  entries: TObject[],
  transformations: Transformations<TObject, TFields>
): Array<TObject & TFields> =>
  entries.map<TObject & TFields>((entry) =>
    transformations.reduce<TObject & TFields>(
      (transformedEntry, transformation) => {
        return operate(transformedEntry, transformation);
      },
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
      entry as TObject & TFields
    )
  );

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

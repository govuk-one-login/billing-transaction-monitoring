import { Constructables, Operations, operationsDict } from "./transform-dicts";

export type InteroperablyTransformable = string | number | Date;

type TransformationSteps = Array<{
  operation: Operations;
  parameter?: number | Constructables;
}>;

interface Transformation<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> {
  inputKey: keyof TObject;
  outputKey: keyof TFields;
  condition: string;
  steps: TransformationSteps;
}

export type Transformations<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> = Array<Transformation<TObject, TFields>>;

const shouldTransform = <TObject extends Record<string, unknown>>(
  value: TObject[keyof TObject],
  condition: string
): boolean => !!String(value).match(new RegExp(condition));

const performTransformationSteps = (
  initialValue: InteroperablyTransformable,
  steps: TransformationSteps
): InteroperablyTransformable =>
  steps.reduce<InteroperablyTransformable>(
    (transformedValue, { operation, parameter }) => {
      return operationsDict[operation](transformedValue, parameter);
    },
    initialValue
  );

const transform = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  entry: TObject,
  { inputKey, outputKey, condition, steps }: Transformation<TObject, TFields>
): TObject & { [outputKey: string]: InteroperablyTransformable } => {
  const initialValue = entry[inputKey] as unknown as InteroperablyTransformable;

  return {
    ...entry,
    [outputKey]: shouldTransform(initialValue, condition)
      ? performTransformationSteps(initialValue, steps)
      : initialValue,
  };
};

const performTransformation = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  entry: TObject,
  transformations: Transformations<TObject, TFields>
): TObject & TFields =>
  transformations.reduce<TObject & TFields>(
    transform,
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    entry as TObject & TFields
  );

export const performTransformations = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  entries: TObject[],
  transformations: Transformations<TObject, TFields>
): Array<TObject & TFields> =>
  entries.map<TObject & TFields>((entry) =>
    performTransformation(entry, transformations)
  );

export const isValidTransformationsConfig = <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  maybeTransformations: unknown
): maybeTransformations is Transformations<TObject, TFields> =>
  Array.isArray(maybeTransformations) &&
  maybeTransformations.every(
    (maybeTransformation) =>
      typeof maybeTransformation === "object" &&
      typeof maybeTransformation.inputKey === "string" &&
      typeof maybeTransformation.outputKey === "string" &&
      typeof maybeTransformation.condition === "string" &&
      Array.isArray(maybeTransformation.steps) &&
      maybeTransformation.steps.every(
        (maybeStep: any) =>
          typeof maybeStep === "object" &&
          maybeStep.operation in Operations &&
          (maybeStep.parameter === undefined ||
            typeof maybeStep?.parameter === "number" ||
            typeof maybeStep?.parameter === "string" ||
            maybeStep.parameter in Constructables)
      )
  );

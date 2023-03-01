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
  condition: RegExp;
  steps: TransformationSteps;
}

export type Transformations<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> = Array<Transformation<TObject, TFields>>;

const shouldNotTransform = <TObject extends Record<string, unknown>>(
  value: TObject[keyof TObject],
  condition: RegExp
): boolean => !String(value).match(condition);

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
  if (shouldNotTransform(entry[inputKey], condition)) {
    return {
      ...entry,
      [outputKey]: initialValue,
    };
  }

  return {
    ...entry,
    [outputKey]: performTransformationSteps(initialValue, steps),
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
    (transformedEntry, transformation) =>
      transform(transformedEntry, transformation),
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

export type InferenceRules<TObject> = Array<{
  given: Partial<TObject>;
  inferValue: unknown;
}>;

export interface InferenceSpecification<
  TObject extends Record<string, unknown>,
  TInferredFields extends Record<string, unknown>
> {
  field: keyof TInferredFields;
  rules: InferenceRules<TObject>;
  defaultValue: unknown;
}

export type InferenceSpecifications<
  TObject extends Record<string, unknown>,
  TInferredFields extends Record<string, unknown>
> = Array<InferenceSpecification<TObject, TInferredFields>>;

const getInferredValue = <
  TObject extends Record<string, unknown>,
  TInferredFields extends Record<string, unknown>
>(
  entry: TObject,
  { rules, defaultValue }: InferenceSpecification<TObject, TInferredFields>
): any =>
  rules.reduce((inferredValue, rule) => {
    const meetsInferenceCriteria = Object.entries(rule.given).every(
      ([key, value]) => {
        return entry[key] === value;
      }
    );
    return meetsInferenceCriteria ? rule.inferValue : inferredValue;
  }, defaultValue);

const makeInference = <
  TObject extends Record<string, unknown>,
  TInferredFields extends Record<string, unknown>
>(
  entry: TObject,
  inferenceSpecifications: InferenceSpecifications<TObject, TInferredFields>
): TObject & TInferredFields =>
  inferenceSpecifications.reduce<TObject & TInferredFields>(
    (augmentedEntry: TObject & TInferredFields, inferenceSpecifications) => {
      if (augmentedEntry[inferenceSpecifications.field] !== undefined) {
        return augmentedEntry;
      }
      return {
        ...augmentedEntry,
        [inferenceSpecifications.field]: getInferredValue(
          entry,
          inferenceSpecifications
        ),
      };
    },
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    entry as TObject & TInferredFields
  );

export const makeInferences = <
  TObject extends Record<string, unknown>,
  TInferredFields extends Record<string, unknown>
>(
  entries: TObject[],
  inferenceSpecifications: InferenceSpecifications<TObject, TInferredFields>
): Array<TObject & TInferredFields> =>
  entries.map((entry) => makeInference(entry, inferenceSpecifications));

export const isValidInferencesConfig = <
  TObject extends Record<string, unknown>,
  TInferredFields extends Record<string, unknown>
>(
  inferences: any
): inferences is InferenceSpecifications<TObject, TInferredFields> => {
  return (
    Array.isArray(inferences) &&
    inferences.every(
      (inference) =>
        typeof inference.field === "string" &&
        Array.isArray(inference.rules) &&
        inference.rules.every((rule: any) => typeof rule.given === "object") &&
        typeof inference.defaultValue === typeof inference.rules[0].inferValue
    )
  );
};

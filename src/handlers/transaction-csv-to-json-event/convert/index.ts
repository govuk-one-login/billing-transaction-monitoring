import { csvToJson } from "./csv-to-json";
import { InferenceSpecifications, makeInferences } from "./make-inferences";
import {
  performTransformations,
  Transformations,
} from "./perform-transformations";

export interface Options<
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
> {
  renamingMap: Map<string, string>; // renaming header row
  inferences: InferenceSpecifications<TObject, TFields>; // rules to infer additional fields
  transformations: Transformations<TObject, TFields>; // operations to transform fields
}

export const convert = async <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  csv: string,
  { renamingMap, inferences, transformations }: Options<TObject, TFields>
): Promise<Array<TObject & TFields>> => {
  const rawObjects = await csvToJson<TObject>(csv, renamingMap);
  const augmentedObjects = makeInferences(rawObjects, inferences);
  const transformedObjects = performTransformations(
    augmentedObjects,
    transformations
  );

  return transformedObjects;
};

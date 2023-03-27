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
  renamingMap: Array<[string, string]>; // renaming header row
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

export const convertMany = async <
  TObject extends Record<string, unknown>,
  TFields extends Record<string, unknown>
>(
  csvs: string[],
  config: Options<TObject, TFields>
): Promise<{
  events: Array<TObject & TFields>;
  failedConversionsCount: number;
  failedEventNameInferenceCount: number;
}> => {
  const promises = await Promise.allSettled(
    csvs.map(async (csv) => await convert(csv, config))
  );

  let failedConversionsCount = 0;
  let failedEventNameInferenceCount = 0;
  const validEvents = promises.reduce<Array<TObject & TFields>>(
    (acc, promiseResult) => {
      if (promiseResult.status === "rejected") {
        failedConversionsCount++;
        return acc;
      }

      const nextAcc = [...acc];
      promiseResult.value.forEach((event) => {
        if (event.event_name === "Unknown") {
          failedEventNameInferenceCount++;
        } else {
          nextAcc.push(event);
        }
      });
      return nextAcc;
    },
    []
  );

  return {
    events: validEvents,
    failedConversionsCount,
    failedEventNameInferenceCount,
  };
};

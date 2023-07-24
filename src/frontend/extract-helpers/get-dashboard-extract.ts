import { fetchS3 } from "../../shared/utils";
import { FullExtractLineItem } from "./types";

let promise: Promise<string>;

export const getDashboardExtract = async (): Promise<FullExtractLineItem[]> => {
  if (process.env.STORAGE_BUCKET === undefined)
    throw new Error("No STORAGE_BUCKET defined in this environment");

  if (promise === undefined)
    promise = fetchS3(
      process.env.STORAGE_BUCKET,
      "btm_extract_data/full-extract.json"
    );

  const extract = await promise;
  const jsonArray = "[" + extract.replace(/\n/g, ",") + "]";
  return JSON.parse(jsonArray);
};

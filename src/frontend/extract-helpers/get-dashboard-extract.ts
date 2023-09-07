import { fetchS3, getFromEnv } from "../../shared/utils";
import { FullExtractLineItem } from "./types";

export const getDashboardExtract = async (): Promise<FullExtractLineItem[]> => {
  const sourceBucket = getFromEnv("STORAGE_BUCKET");

  if (sourceBucket === undefined)
    throw new Error("No STORAGE_BUCKET defined in this environment");

  const extract = await fetchS3(
    sourceBucket,
    "btm_extract_data/full-extract.json"
  );

  const jsonArray = "[" + extract.replace(/\n/g, ",") + "]";
  return JSON.parse(jsonArray);
};

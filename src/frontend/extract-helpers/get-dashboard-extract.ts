import { fetchS3 } from "../../shared/utils";
import { FullExtractLineItem } from "./types";

export const getDashboardExtract = async (): Promise<FullExtractLineItem[]> => {
  if (process.env.STORAGE_BUCKET === undefined)
    throw new Error("No STORAGE_BUCKET defined in this environment");

  const extract = await fetchS3(
    process.env.STORAGE_BUCKET,
    "btm_extract_data/full-extract.json"
  );

  const jsonArray = "[" + extract.replace(/\n/g, ",") + "]";
  return JSON.parse(jsonArray);
};

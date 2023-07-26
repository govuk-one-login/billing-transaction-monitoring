import { fetchS3 } from "../../shared/utils";
import { FullExtractLineItem } from "./types";
import { DASHBOARD_EXTRACT_PATH } from "../../shared/constants";

let promise: Promise<string>;

export const getDashboardExtract = async (): Promise<FullExtractLineItem[]> => {
  if (process.env.STORAGE_BUCKET === undefined)
    throw new Error("No STORAGE_BUCKET defined in this environment");

  if (promise === undefined)
    promise = fetchS3(process.env.STORAGE_BUCKET, DASHBOARD_EXTRACT_PATH);

  const extract = await promise;
  const jsonArray = "[" + extract.replace(/\n/g, ",") + "]";
  return JSON.parse(jsonArray);
};

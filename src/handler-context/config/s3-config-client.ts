import csvToJson from "csvtojson";
import { ConfigFileNames, GetConfigFile } from "./types";
import { Json } from "../../shared/types";
import { fetchS3 } from "../../shared/utils";

const fileMap: Record<ConfigFileNames, string> = {
  [ConfigFileNames.rates]: "rate_tables/rates.csv",
  [ConfigFileNames.services]: "vendor_services/vendor-services.csv",
  [ConfigFileNames.renamingMap]:
    "csv_transactions/header-row-renaming-map.json",
  [ConfigFileNames.inferences]: "csv_transactions/event-inferences.json",
  [ConfigFileNames.transformations]:
    "csv_transactions/event-transformation.json",
  [ConfigFileNames.vat]: "uk-vat.json",
  [ConfigFileNames.standardisation]: "vendor-invoice-standardisation.json",
};

const parseCsvFile = async (rawFile: string): Promise<Json> => {
  return await csvToJson().fromString(rawFile);
};
const parseJsonFile = (rawFile: string): Json => {
  return JSON.parse(rawFile);
};

const parseConfigFile = async (
  rawFile: string,
  fileExtension: string
): Promise<Json> => {
  switch (fileExtension) {
    case "json":
      return parseJsonFile(rawFile);
    case "csv":
      return await parseCsvFile(rawFile);
    default:
      throw new Error(
        `Config file extension could not be mapped to a parser. The extension was ${fileExtension}`
      );
  }
};

export const getConfigFile: GetConfigFile = async (fileName) => {
  if (process.env.CONFIG_BUCKET === undefined)
    throw new Error("No CONFIG_BUCKET defined in this environment");

  const path = fileMap[fileName];
  const fileExtension = path.split(".").reverse()[0];

  if (!fileExtension)
    throw new Error(
      `Config file extension could not be determined. The path was ${path}`
    );

  const response = await fetchS3(process.env.CONFIG_BUCKET, path);

  return await parseConfigFile(response, fileExtension);
};

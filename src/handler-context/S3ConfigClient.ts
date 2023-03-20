import csvToJson from "csvtojson";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigFileNames } from "./Config";
import { Json } from "../shared/types";

enum FileExtensions {
  csv,
  json,
}

const fileMap: Record<
  ConfigFileNames,
  { path: string; fileExtension: FileExtensions }
> = {
  [ConfigFileNames.rates]: {
    path: "rate_tables/rates.csv",
    fileExtension: FileExtensions.csv,
  },
  [ConfigFileNames.services]: {
    path: "vendor_services/vendor-services.csv",
    fileExtension: FileExtensions.csv,
  },
  [ConfigFileNames.renamingMap]: {
    path: "csv_transactions/header-row-renaming-map.json",
    fileExtension: FileExtensions.json,
  },
  [ConfigFileNames.inferences]: {
    path: "csv_transactions/event-inferences.json",
    fileExtension: FileExtensions.json,
  },
  [ConfigFileNames.transformations]: {
    path: "csv_transactions/event-transformation.json",
    fileExtension: FileExtensions.json,
  },
  [ConfigFileNames.vat]: {
    path: "uk-vat.json",
    fileExtension: FileExtensions.json,
  },
  [ConfigFileNames.standardisation]: {
    path: "vendor-invoice-standardisation.json",
    fileExtension: FileExtensions.json,
  },
};

const parseCsvFile = async (rawFile: string): Promise<Json> => {
  return await csvToJson().fromString(rawFile);
};
const parseJsonFile = (rawFile: string): Json => {
  return JSON.parse(rawFile);
};

const parseConfigFile = async (
  rawFile: string,
  fileExtension: FileExtensions
): Promise<Json> => {
  switch (fileExtension) {
    case FileExtensions.json:
      return parseJsonFile(rawFile);
    case FileExtensions.csv:
      return await parseCsvFile(rawFile);
  }
};

const getClient = (): S3Client =>
  new S3Client({
    region: "eu-west-2",
    endpoint: process.env.LOCAL_ENDPOINT,
  });

export class S3ConfigFileClient {
  private readonly _client: S3Client;

  constructor() {
    this._client = getClient();
  }

  public readonly getConfigFile = async (
    fileName: ConfigFileNames
  ): Promise<Json> => {
    const { path, fileExtension } = fileMap[fileName];

    const response = await this._client.send(
      new GetObjectCommand({
        Bucket: process.env.CONFIG_BUCKET,
        Key: path,
      })
    );
    if (response.Body === undefined) {
      throw new Error(`Config file could not be found at ${path}`);
    }
    return await parseConfigFile(
      await response.Body.transformToString(),
      fileExtension
    );
  };
}

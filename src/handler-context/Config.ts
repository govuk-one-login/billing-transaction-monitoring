import csvToJson from "csvtojson";
import { InferenceSpecifications } from "../handlers/transaction-csv-to-json-event/convert/make-inferences";
import { Transformations } from "../handlers/transaction-csv-to-json-event/convert/perform-transformations";

export enum ConfigFileNames {
  rates = "rates",
  services = "services",
  renamingMap = "renamingMap",
  inferences = "inferences",
  transformations = "transformations",
  vat = "vat",
  standardisation = "standardisation",
}

export interface ConfigFiles {
  [ConfigFileNames.rates]: Array<{
    vendor_id: string;
    event_name: string;
    volumes_from: string;
    volumes_to: string;
    unit_price: string;
    effective_from: string;
    effective_to: string;
  }>;
  [ConfigFileNames.services]: Array<{
    vendor_name: string;
    vendor_id: string;
    service_name: string;
    service_regex: string;
    event_name: string;
  }>;
  [ConfigFileNames.renamingMap]: Array<[string, string]>;
  [ConfigFileNames.inferences]: InferenceSpecifications<
    {}, // I'm avoiding including this type as the field names are sensitive
    { event_name: string }
  >;
  [ConfigFileNames.transformations]: Transformations<{}, {}>;
  [ConfigFileNames.vat]: Array<{ rate: number; start: string }>;
  [ConfigFileNames.standardisation]: Array<{
    vendorId: string;
    invoiceStandardisationModuleId: number;
  }>;
}

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

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

interface ConfigClient {
  getConfigFile: (path: string) => Promise<string>;
}

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

export class Config<TFileName extends ConfigFileNames> {
  private readonly _client: ConfigClient;
  private readonly _files: ConfigFileNames[];
  private _cache!: Omit<ConfigFiles, keyof Omit<ConfigFiles, TFileName>>;
  private _promises!: Array<
    Promise<{
      parsedFile: Json;
      fileName: ConfigFileNames;
    }>
  >;

  constructor(client: ConfigClient, files: TFileName[]) {
    this._client = client;
    this._files = files;
    this._populatePromises();
    void this._populateCache();
  }

  private readonly _populatePromises = (): void => {
    if (process.env.CONFIG_BUCKET === undefined)
      throw new Error("No CONFIG_BUCKET defined in this environment");

    this._promises = this._files.map(async (fileName) => {
      const { path, fileExtension } = fileMap[fileName];
      const promise = (async (): Promise<{
        parsedFile: Json;
        fileName: ConfigFileNames;
      }> => {
        const rawFile = await this._client.getConfigFile(path);
        const parsedFile = await parseConfigFile(rawFile, fileExtension);
        return { parsedFile, fileName };
      })();
      return await promise;
    });
  };

  private readonly _populateCache = async (): Promise<void> => {
    const resolutions = await Promise.allSettled(this._promises);
    // @ts-expect-error
    this._cache = resolutions.reduce<
      Omit<ConfigFiles, keyof Omit<ConfigFiles, TFileName>>
    >((_config, resolution) => {
      if (resolution.status === "rejected") throw new Error(resolution.reason);
      const { parsedFile, fileName } = resolution.value;
      return {
        ..._config,
        [fileName]: parsedFile,
      };
      // @ts-expect-error
    }, {});
  };

  public readonly getCache = (): Omit<
    ConfigFiles,
    keyof Omit<ConfigFiles, TFileName>
  > => this._cache;
}

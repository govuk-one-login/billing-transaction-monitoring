import csvToJson from "csvtojson";

export enum ConfigFileNames {
  rates = "rates",
  services = "services",
  renamingMap = "renamingMap",
  inferences = "inferences",
  transformations = "transformations",
  vat = "vat",
  standardisation = "standardisation",
  e2eTest = "e2eTest",
}

export type ConfigFiles = Record<ConfigFileNames, unknown>;

enum FileTypes {
  csv,
  json,
}

const fileMap: Record<ConfigFileNames, { path: string; type: FileTypes }> = {
  [ConfigFileNames.rates]: {
    path: "rate_tables/rates.csv",
    type: FileTypes.csv,
  },
  [ConfigFileNames.services]: {
    path: "vendor_services/vendor-services.csv",
    type: FileTypes.csv,
  },
  [ConfigFileNames.renamingMap]: {
    path: "csv_transactions/header-row-renaming-map.json",
    type: FileTypes.json,
  },
  [ConfigFileNames.inferences]: {
    path: "csv_transactions/event-inferences.json",
    type: FileTypes.json,
  },
  [ConfigFileNames.transformations]: {
    path: "csv_transactions/event-transformation.json",
    type: FileTypes.json,
  },
  [ConfigFileNames.vat]: { path: "uk-vat.json", type: FileTypes.json },
  [ConfigFileNames.standardisation]: {
    path: "vendor-invoice-standardisation.json",
    type: FileTypes.json,
  },
  [ConfigFileNames.e2eTest]: { path: "e2e-test.json", type: FileTypes.json },
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
  type: FileTypes
): Promise<Json> => {
  switch (type) {
    case FileTypes.json:
      return parseJsonFile(rawFile);
    case FileTypes.csv:
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
      const { path, type } = fileMap[fileName];
      const promise = (async (): Promise<{
        parsedFile: Json;
        fileName: ConfigFileNames;
      }> => {
        const rawFile = await this._client.getConfigFile(path);
        const parsedFile = await parseConfigFile(rawFile, type);
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

// the config utils we have are actually single use thingies so honestly I'm
// tempted to say that reshaping a specific config file to meet a given handler's
// needs is actually business logic. I'm not gunna worry about these for now, I'll
// just get this config cacher up, move the fetchEventNames logic into filterBusinessLogic
// and see how it looks.

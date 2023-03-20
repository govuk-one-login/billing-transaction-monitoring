import { Logger } from "@aws-lambda-powertools/logger";
import { InferenceSpecifications } from "../handlers/transaction-csv-to-json-event/convert/make-inferences";
import { Transformations } from "../handlers/transaction-csv-to-json-event/convert/perform-transformations";
import { Json } from "../shared/types";

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

export interface ConfigClient {
  getConfigFile: (fileName: ConfigFileNames) => Promise<Json>;
}

export class Config<TFileName extends ConfigFileNames> {
  private readonly _client: ConfigClient;
  private readonly _files: ConfigFileNames[];
  private readonly _logger: Logger;
  private _hasCacheBeenPopulated: boolean = false;
  private _cache!: Omit<ConfigFiles, keyof Omit<ConfigFiles, TFileName>>;
  private _promises!: Array<
    Promise<{
      file: Json;
      fileName: ConfigFileNames;
    }>
  >;

  constructor(client: ConfigClient, files: TFileName[], logger: Logger) {
    this._client = client;
    this._files = files;
    this._logger = logger;
    this._populatePromises();
  }

  private readonly _populatePromises = (): void => {
    if (process.env.CONFIG_BUCKET === undefined)
      throw new Error("No CONFIG_BUCKET defined in this environment");

    this._promises = this._files.map(async (fileName) => {
      const promise = (async (): Promise<{
        file: Json;
        fileName: ConfigFileNames;
      }> => {
        const file = await this._client.getConfigFile(fileName);
        return { file, fileName };
      })();
      return await promise;
    });
  };

  public readonly populateCache = async (): Promise<void> => {
    const resolutions = await Promise.allSettled(this._promises);
    // @ts-expect-error
    this._cache = resolutions.reduce<
      Omit<ConfigFiles, keyof Omit<ConfigFiles, TFileName>>
    >((_config, resolution) => {
      if (resolution.status === "rejected") throw new Error(resolution.reason);
      const { file, fileName } = resolution.value;
      return {
        ..._config,
        [fileName]: file,
      };
      // @ts-expect-error
    }, {});
    this._hasCacheBeenPopulated = true;
  };

  public readonly getCache = (): Omit<
    ConfigFiles,
    keyof Omit<ConfigFiles, TFileName>
  > => {
    if (!this._hasCacheBeenPopulated) {
      this._logger.warn(
        "Called getCache before awaiting populateCache. Consider ensuing the cache is populated before reading it."
      );
    }
    return this._cache;
  };
}

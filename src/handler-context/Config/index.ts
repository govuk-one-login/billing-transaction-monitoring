import { Logger } from "@aws-lambda-powertools/logger";
import { Json } from "../../shared/types";
import { ConfigClient, ConfigFileNames, ConfigFiles } from "./types";

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

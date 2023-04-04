import { Json } from "../../shared/types";
import { ConfigFileNames, ConfigClient, PickedFiles } from "./types";

export class Config<TFileName extends ConfigFileNames> {
  private readonly client: ConfigClient;
  private readonly files: ConfigFileNames[];
  private readonly promises: Array<Promise<[ConfigFileNames, Json]>>;
  private cache: PickedFiles<TFileName> | undefined;

  constructor(client: ConfigClient, files: TFileName[]) {
    this.client = client;
    this.files = files;
    this.promises = this.spawnPromises();
  }

  private readonly spawnPromises = (): Array<
    Promise<[ConfigFileNames, Json]>
  > => {
    if (process.env.CONFIG_BUCKET === undefined)
      throw new Error("No CONFIG_BUCKET defined in this environment");

    return this.files.map<Promise<[ConfigFileNames, Json]>>(
      async (fileName) => [fileName, await this.client.getConfigFile(fileName)]
    );
  };

  public readonly populateCache = async (): Promise<void> => {
    const cacheEntries = await Promise.all(this.promises);
    this.cache = Object.fromEntries(cacheEntries) as PickedFiles<TFileName>;
  };

  public readonly getCache = (): PickedFiles<TFileName> => {
    if (this.cache === undefined) {
      throw new Error(
        "Called getCache before awaiting populateCache. Ensure the cache is populated before reading it."
      );
    }
    return this.cache;
  };
}

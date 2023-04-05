import { Json } from "../../shared/types";
import { ConfigElements, GetConfigFile, PickedConfigCache } from "./types";

export class Config<TFileName extends ConfigElements> {
  private readonly getConfigFile: GetConfigFile;
  private readonly files: ConfigElements[];
  private readonly promises: Array<Promise<[ConfigElements, Json]>>;
  private cache: PickedConfigCache<TFileName> | undefined;

  constructor(getConfigFile: GetConfigFile, files: TFileName[]) {
    this.getConfigFile = getConfigFile;
    this.files = files;
    this.promises = this.spawnPromises();
  }

  private readonly spawnPromises = (): Array<
    Promise<[ConfigElements, Json]>
  > => {
    return this.files.map<Promise<[ConfigElements, Json]>>(async (fileName) => [
      fileName,
      await this.getConfigFile(fileName),
    ]);
  };

  public readonly populateCache = async (): Promise<void> => {
    const cacheEntries = await Promise.all(this.promises);
    this.cache = Object.fromEntries(
      cacheEntries
    ) as PickedConfigCache<TFileName>;
  };

  public readonly getCache = (): PickedConfigCache<TFileName> => {
    if (this.cache === undefined) {
      throw new Error(
        "Called getCache before awaiting populateCache. Ensure the cache is populated before reading it."
      );
    }
    return this.cache;
  };
}

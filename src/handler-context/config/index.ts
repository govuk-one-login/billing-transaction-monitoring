import { Json } from "../../shared/types";
import { ConfigFileNames, GetConfigFile, PickedConfigFiles } from "./types";

export class Config<TFileName extends ConfigFileNames> {
  private readonly getConfigFile: GetConfigFile;
  private readonly files: ConfigFileNames[];
  private readonly promises: Array<Promise<[ConfigFileNames, Json]>>;
  private cache: PickedConfigFiles<TFileName> | undefined;

  constructor(getConfigFile: GetConfigFile, files: TFileName[]) {
    this.getConfigFile = getConfigFile;
    this.files = files;
    this.promises = this.spawnPromises();
  }

  private readonly spawnPromises = (): Array<
    Promise<[ConfigFileNames, Json]>
  > => {
    return this.files.map<Promise<[ConfigFileNames, Json]>>(
      async (fileName) => [fileName, await this.getConfigFile(fileName)]
    );
  };

  public readonly populateCache = async (): Promise<void> => {
    const cacheEntries = await Promise.all(this.promises);
    this.cache = Object.fromEntries(
      cacheEntries
    ) as PickedConfigFiles<TFileName>;
  };

  public readonly getCache = (): PickedConfigFiles<TFileName> => {
    if (this.cache === undefined) {
      throw new Error(
        "Called getCache before awaiting populateCache. Ensure the cache is populated before reading it."
      );
    }
    return this.cache;
  };
}

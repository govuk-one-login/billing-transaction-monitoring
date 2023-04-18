import { Json } from "../../shared/types";
import { getConfigFile } from "./s3-config-client";
import { ConfigElements, PickedConfigCache } from "./types";

export class Config<TFileName extends ConfigElements> {
  private readonly files: ConfigElements[];
  private cache: PickedConfigCache<TFileName> | undefined;

  constructor(files: TFileName[]) {
    this.files = files;
  }

  public readonly populateCache = async (): Promise<void> => {
    const promises = this.files.map<Promise<[ConfigElements, Json]>>(
      async (fileName) => [fileName, await getConfigFile(fileName)]
    );
    const cacheEntries = await Promise.all(promises);
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

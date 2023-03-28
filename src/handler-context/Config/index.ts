import { Logger } from "@aws-lambda-powertools/logger";
import { Json } from "../../shared/types";
import { ConfigFileNames, ConfigClient, PickedFiles } from "./types";

export class Config<TFileName extends ConfigFileNames> {
  private readonly client: ConfigClient;
  private readonly files: ConfigFileNames[];
  private readonly logger: Logger;
  private hasCacheBeenPopulated: boolean = false;
  private cache!: PickedFiles<TFileName>;
  private promises!: Array<
    Promise<{
      file: Json;
      fileName: ConfigFileNames;
    }>
  >;

  constructor(client: ConfigClient, files: TFileName[], logger: Logger) {
    this.client = client;
    this.files = files;
    this.logger = logger;
    this.populatePromises();
  }

  private readonly populatePromises = (): void => {
    if (process.env.CONFIG_BUCKET === undefined)
      throw new Error("No CONFIG_BUCKET defined in this environment");

    this.promises = this.files.map(async (fileName) => ({
      file: await this.client.getConfigFile(fileName),
      fileName,
    }));
  };

  public readonly populateCache = async (): Promise<void> => {
    const resolutions = await Promise.allSettled(this.promises);
    // @ts-expect-error
    this.cache = resolutions.reduce<PickedFiles<TFileName>>(
      (config, resolution) => {
        if (resolution.status === "rejected")
          throw new Error(resolution.reason);
        const { file, fileName } = resolution.value;
        return {
          ...config,
          [fileName]: file,
        };
      },
      // @ts-expect-error
      {}
    );
    this.hasCacheBeenPopulated = true;
  };

  public readonly getCache = (): PickedFiles<TFileName> => {
    if (!this.hasCacheBeenPopulated) {
      this.logger.warn(
        "Called getCache before awaiting populateCache. Ensue the cache is populated before reading it."
      );
    }
    return this.cache;
  };
}

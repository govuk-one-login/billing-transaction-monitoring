import { Config, ConfigElements, PickedConfigCache } from "../../config";

export const makeCtxConfig = async <TConfigElements extends ConfigElements>(
  files: TConfigElements[]
): Promise<PickedConfigCache<TConfigElements>> => {
  const config = new Config(files);
  await config.populateCache();
  return config.getCache();
};

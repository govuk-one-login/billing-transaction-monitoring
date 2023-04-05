import { getConfigFile } from "../../../config/s3-config-client";
import { Config } from "../../../config";
import { ConfigElements, PickedConfigCache } from "../../../config";

export const makeCtxConfig = async <TConfigElements extends ConfigElements>(
  files: TConfigElements[]
): Promise<PickedConfigCache<TConfigElements>> => {
  const config = new Config(getConfigFile, files);
  await config.populateCache();
  return config.getCache();
};

import { getConfigFile } from "../../../config/s3-config-client";
import { Config } from "../../../config";
import { ConfigFileNames, PickedConfigFiles } from "../../../config/types";

export const makeCtxConfig = async <TConfigFileNames extends ConfigFileNames>(
  files: TConfigFileNames[]
): Promise<PickedConfigFiles<TConfigFileNames>> => {
  const config = new Config(getConfigFile, files);
  await config.populateCache();
  return config.getCache();
};

import { s3ConfigFileClient } from "../config/s3-config-client";
import { Config } from "../config";
import { ConfigFileNames, PickedFiles } from "../config/types";

export const makeCtxConfig = async <TConfigFileNames extends ConfigFileNames>(
  files: TConfigFileNames[]
): Promise<PickedFiles<TConfigFileNames>> => {
  const config = new Config(s3ConfigFileClient, files);
  await config.populateCache();
  return config.getCache();
};

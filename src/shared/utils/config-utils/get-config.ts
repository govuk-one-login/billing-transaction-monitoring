import { ConfigElements } from "../../constants";
import { ConfigCache } from "../../types";
import { getConfigFile } from "./s3-config-client";

export type CachedConfigPromisesByElement = Partial<{
  [T in ConfigElements]: Promise<ConfigCache[T]>;
}>;

const cachedConfigPromisesByFile: CachedConfigPromisesByElement = {};

export const getConfig = async <T extends ConfigElements>(
  fileName: T
): Promise<ConfigCache[T]> => {
  const cachedPromise = cachedConfigPromisesByFile[fileName];
  if (cachedPromise !== undefined) return await cachedPromise;
  const promise = getConfigFile(fileName);
  (cachedConfigPromisesByFile[fileName] as Promise<ConfigCache[T]>) = promise;
  return await promise;
};

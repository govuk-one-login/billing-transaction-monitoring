import { HandlerOptions } from "../types";
import {
  ConfigElements,
  makeCtxConfig,
} from "../../../handler-context/context-builder";
import { PickedConfigCache } from "../../../handler-context/config";

export const appConfig = async <TConfigElements extends ConfigElements>({
  ConfigCache,
}: HandlerOptions<TConfigElements>): Promise<
  PickedConfigCache<TConfigElements>
> => {
  return await makeCtxConfig(ConfigCache);
};

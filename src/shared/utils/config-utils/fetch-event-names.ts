import { ConfigElements } from "../../constants";
import { getConfig } from "./get-config";

export const fetchEventNames = async (): Promise<Set<string>> => {
  const vendorServiceConfig = await getConfig(ConfigElements.services);
  return new Set(vendorServiceConfig.map(({ event_name }) => event_name));
};

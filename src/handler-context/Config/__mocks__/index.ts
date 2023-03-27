import { ConfigFiles } from "../types";

// TODO: fill in the rest of these
const config: ConfigFiles = {
  rates: [],
  services: [
    {
      vendor_name: "Skippy's",
      vendor_id: "ven_1",
      service_name: "Tartan Paint",
      service_regex: "SDH[0-9]{0,5} paint",
      event_name: "EXECUTIVE_ENDUNKENING_COMPLETED",
    },
    {
      vendor_name: "Skippy's",
      vendor_id: "ven_1",
      service_name: "Spirit Level Bubbles",
      service_regex: "SDH[0-9]{0,5} bubble",
      event_name: "SPIRIT_CONSUMPTION_EXECUTION_TASK_START",
    },
  ],
  renamingMap: [],
  inferences: [],
  transformations: [],
  vat: [{ rate: 20, start: "string" }],
  standardisation: [],
};

let configOverrides = Object.create(null);
export const __setConfigOverrides = (overrides: Partial<ConfigFiles>): void => {
  configOverrides = overrides;
};

export const __resetOverrides = (): void => {
  configOverrides = Object.create(null);
};

export class Config {
  public readonly getCache = (): ConfigFiles => ({
    ...config,
    ...configOverrides,
  });

  public readonly populateCache = (): void => {};
}

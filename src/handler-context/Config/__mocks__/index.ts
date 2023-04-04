import { Transformations } from "../../../handlers/transaction-csv-to-json-event/convert/perform-transformations";
import {
  Constructables,
  Operations,
} from "../../../handlers/transaction-csv-to-json-event/convert/transform-dicts";
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
  renamingMap: [["a", "id"]],
  inferences: [
    {
      field: "event_name",
      rules: [{ given: { id: "one", color: "red" }, inferValue: "TEST_EVENT" }],
      defaultValue: "Unknown",
    },
  ],
  transformations: [
    {
      inputKey: "timestamp",
      outputKey: "timestamp",
      condition: "^\\d{10}$",
      steps: [
        {
          operation: Operations.construct,
          parameter: Constructables.number,
        },
      ],
    },
  ] as Transformations<{}, {}>,
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

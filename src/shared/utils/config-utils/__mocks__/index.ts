import { Transformations } from "../../../../handlers/transaction-csv-to-json-event/convert/perform-transformations";
import {
  Constructables,
  Operations,
} from "../../../../handlers/transaction-csv-to-json-event/convert/transform-dicts";
import { ConfigCache } from "../../../types";

// TODO: fill in the rest of these
const config: ConfigCache = {
  rates: [],
  services: [
    {
      vendor_name: "Skippy's",
      vendor_id: "ven_1",
      service_name: "Tartan Paint",
      service_regex: "SDH[0-9]{0,5} paint",
      event_name: "EXECUTIVE_ENDUNKENING_COMPLETED",
      contract_id: "1",
    },
    {
      vendor_name: "Skippy's",
      vendor_id: "ven_1",
      service_name: "Spirit Level Bubbles",
      service_regex: "SDH[0-9]{0,5} bubble",
      event_name: "SPIRIT_CONSUMPTION_EXECUTION_TASK_START",
      contract_id: "1",
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
  eventCleaningTransform: {
    credits: [
      "!If",
      ["!Not", ["!Equals", ["!Path", "$.user.transaction_id"], []]],
      2,
      1,
    ],
  },
  contracts: [],
  syntheticEvents: [
    {
      event_name: "VENDOR_5_TPS",
      quantity: 7,
      start_date: "2005-01-01",
      frequency: "monthly",
      vendor_id: "vendor_testvendor5",
      component_id: "my_component_id",
    },
  ],
};

let configOverrides = Object.create(null);
export const __setConfigOverrides = (overrides: Partial<ConfigCache>): void => {
  configOverrides = overrides;
};

export const __resetOverrides = (): void => {
  configOverrides = Object.create(null);
};

export class Config {
  public readonly getCache = (): ConfigCache => ({
    ...config,
    ...configOverrides,
  });

  public readonly populateCache = (): void => {};
}

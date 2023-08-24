import { ConfigElements } from "../../constants";
import {
  ConfigCache,
  ConfigContractsRow,
  ConfigRatesRow,
  ConfigServicesRow,
  GetConfigFile,
  Json,
} from "../../types";
import { fetchS3 } from "..";
import { getFromEnv } from "../env";
import { parseConfigCsv } from "./parse-config-csv";

export const configFileMap: Record<ConfigElements, string> = {
  [ConfigElements.rates]: "rate_tables/rates.csv",
  [ConfigElements.services]: "vendor_services/vendor-services.csv",
  [ConfigElements.contracts]: "contracts/contracts.csv",
  [ConfigElements.renamingMap]: "csv_transactions/header-row-renaming-map.json",
  [ConfigElements.inferences]: "csv_transactions/event-inferences.json",
  [ConfigElements.transformations]:
    "csv_transactions/event-transformation.json",
  [ConfigElements.vat]: "uk-vat.json",
  [ConfigElements.standardisation]: "vendor-invoice-standardisation.json",
  [ConfigElements.eventCleaningTransform]: "event_transforms/config.json",
  [ConfigElements.syntheticEvents]: "synthetic_events/synthetic-events.json",
};

const parseJsonFile = async (rawFile: string): Promise<Json> => {
  return JSON.parse(rawFile);
};

const parserMap = {
  [ConfigElements.rates]: async (rawFile: string) =>
    await parseConfigCsv<keyof ConfigRatesRow, ConfigRatesRow>(rawFile, {
      vendor_id: { type: "string", required: true },
      event_name: { type: "string", required: true },
      volumes_from: { type: "number", required: true },
      volumes_to: { type: "number", required: false },
      unit_price: { type: "number", required: true },
      effective_from: { type: "date", required: true },
      effective_to: { type: "date", required: true },
    }),
  [ConfigElements.services]: async (rawFile: string) =>
    await parseConfigCsv<keyof ConfigServicesRow, ConfigServicesRow>(rawFile, {
      vendor_name: { type: "string", required: true },
      vendor_id: { type: "string", required: true },
      service_name: { type: "string", required: true },
      service_regex: { type: "string", required: true },
      event_name: { type: "string", required: true },
      contract_id: { type: "string", required: true },
    }),
  [ConfigElements.contracts]: async (rawFile: string) =>
    await parseConfigCsv<keyof ConfigContractsRow, ConfigContractsRow>(
      rawFile,
      {
        id: { type: "string", required: true },
        name: { type: "string", required: true },
        vendor_id: { type: "string", required: true },
      }
    ),
  [ConfigElements.renamingMap]: parseJsonFile,
  [ConfigElements.inferences]: parseJsonFile,
  [ConfigElements.transformations]: parseJsonFile,
  [ConfigElements.vat]: parseJsonFile,
  [ConfigElements.standardisation]: parseJsonFile,
  [ConfigElements.eventCleaningTransform]: parseJsonFile,
  [ConfigElements.syntheticEvents]: parseJsonFile,
};

const parseConfigFile = async <TFileName extends ConfigElements>(
  fileName: TFileName,
  rawFile: string
): Promise<ConfigCache[TFileName]> => {
  const parser = parserMap[fileName];
  const result = await parser(rawFile);
  return result as ConfigCache[TFileName];
};

export const getConfigFile: GetConfigFile = async (fileName) => {
  const bucket = getFromEnv("CONFIG_BUCKET");

  if (bucket === undefined)
    throw new Error("No CONFIG_BUCKET defined in this environment");

  const path = configFileMap[fileName];

  const response = await fetchS3(bucket, path);

  return await parseConfigFile(fileName, response);
};

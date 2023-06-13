import { InferenceSpecifications } from "../../handlers/transaction-csv-to-json-event/convert/make-inferences";
import { Transformations } from "../../handlers/transaction-csv-to-json-event/convert/perform-transformations";

export enum ConfigElements {
  rates = "rates",
  services = "services",
  renamingMap = "renamingMap",
  inferences = "inferences",
  transformations = "transformations",
  vat = "vat",
  standardisation = "standardisation",
  eventCleaningTransform = "eventCleaningTransform",
}

export interface ConfigRatesRow {
  vendor_id: string;
  event_name: string;
  volumes_from: number;
  volumes_to: number | undefined;
  unit_price: number;
  effective_from: Date;
  effective_to: Date;
}

export interface ConfigServicesRow {
  vendor_name: string;
  vendor_id: string;
  service_name: string;
  service_regex: string;
  event_name: string;
}

export interface ConfigCache {
  [ConfigElements.rates]: ConfigRatesRow[];
  [ConfigElements.services]: ConfigServicesRow[];
  [ConfigElements.renamingMap]: Array<[string, string]>;
  [ConfigElements.inferences]: InferenceSpecifications<
    {}, // I'm avoiding including this type as the field names are sensitive
    { event_name: string }
  >;
  [ConfigElements.transformations]: Transformations<{}, {}>;
  [ConfigElements.vat]: Array<{ rate: number; start: string }>;
  [ConfigElements.standardisation]: Array<{
    vendorId: string;
    invoiceStandardisationModuleId: number;
  }>;
  [ConfigElements.eventCleaningTransform]: any;
}

export type GetConfigFile = <TFileName extends ConfigElements>(
  fileName: TFileName
) => Promise<ConfigCache[TFileName]>;

export type PickedConfigCache<TFileName extends ConfigElements> = Pick<
  ConfigCache,
  TFileName
>;

export type CsvColumnTypeName = "date" | "number" | "string";
export type CsvColumnValue = Date | number | string | undefined;

export type ConfigParser<TConfig extends {} | Array<{}>> = (
  rawFile: string
) => TConfig | Promise<TConfig>;

export interface CsvParserColumnOptions {
  type: CsvColumnTypeName;
  required?: boolean;
}

export type CsvParserOptions<
  TColumn extends string,
  TRow extends Record<TColumn, CsvColumnValue>
> = Record<keyof TRow, CsvParserColumnOptions>;

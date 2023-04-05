import { InferenceSpecifications } from "../../handlers/transaction-csv-to-json-event/convert/make-inferences";
import { Transformations } from "../../handlers/transaction-csv-to-json-event/convert/perform-transformations";
import { Json } from "../../shared/types";

export enum ConfigElements {
  rates = "rates",
  services = "services",
  renamingMap = "renamingMap",
  inferences = "inferences",
  transformations = "transformations",
  vat = "vat",
  standardisation = "standardisation",
}

export interface ConfigCache {
  [ConfigElements.rates]: Array<{
    vendor_id: string;
    event_name: string;
    volumes_from: string;
    volumes_to: string;
    unit_price: string;
    effective_from: string;
    effective_to: string;
  }>;
  [ConfigElements.services]: Array<{
    vendor_name: string;
    vendor_id: string;
    service_name: string;
    service_regex: string;
    event_name: string;
  }>;
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
}

export type GetConfigFile = (fileName: ConfigElements) => Promise<Json>;

export type PickedConfigCache<TFileName extends ConfigElements> = Pick<
  ConfigCache,
  TFileName
>;

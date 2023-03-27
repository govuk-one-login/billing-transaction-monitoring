import { InferenceSpecifications } from "../../handlers/transaction-csv-to-json-event/convert/make-inferences";
import { Transformations } from "../../handlers/transaction-csv-to-json-event/convert/perform-transformations";
import { Json } from "../../shared/types";

export enum ConfigFileNames {
  rates = "rates",
  services = "services",
  renamingMap = "renamingMap",
  inferences = "inferences",
  transformations = "transformations",
  vat = "vat",
  standardisation = "standardisation",
}

export interface ConfigFiles {
  [ConfigFileNames.rates]: Array<{
    vendor_id: string;
    event_name: string;
    volumes_from: string;
    volumes_to: string;
    unit_price: string;
    effective_from: string;
    effective_to: string;
  }>;
  [ConfigFileNames.services]: Array<{
    vendor_name: string;
    vendor_id: string;
    service_name: string;
    service_regex: string;
    event_name: string;
  }>;
  [ConfigFileNames.renamingMap]: Array<[string, string]>;
  [ConfigFileNames.inferences]: InferenceSpecifications<
    {}, // I'm avoiding including this type as the field names are sensitive
    { event_name: string }
  >;
  [ConfigFileNames.transformations]: Transformations<{}, {}>;
  [ConfigFileNames.vat]: Array<{ rate: number; start: string }>;
  [ConfigFileNames.standardisation]: Array<{
    vendorId: string;
    invoiceStandardisationModuleId: number;
  }>;
}

export interface ConfigClient {
  getConfigFile: (fileName: ConfigFileNames) => Promise<Json>;
}

import { Command } from "../handlers/clean/xform";
import { InferenceSpecifications } from "../handlers/transaction-csv-to-json-event/convert/make-inferences";
import { Transformations } from "../handlers/transaction-csv-to-json-event/convert/perform-transformations";
import { ConfigElements } from "./constants";

export interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export type ValidTextractJobStatus = "FAILED" | "PARTIAL_SUCCESS" | "SUCCEEDED";

export type Json = string | number | boolean | null | Json[] | {};

export interface StandardisedLineItemSummary {
  invoice_receipt_id: string;
  vendor_id?: string;
  vendor_name?: string;
  total: number;
  invoice_receipt_date: string;
  invoice_period_start: string;
  subtotal?: number;
  due_date?: string;
  tax?: number;
  tax_payer_id?: string;
  // May not be present in old items, but required here to ensure they are added to new ones:
  parser_version: string;
  originalInvoiceFile: string;
  invoice_is_quarterly: boolean;
}

export interface StandardisedLineItem extends StandardisedLineItemSummary {
  item_id?: number;
  item_description?: string;
  service_name?: string;
  contract_id?: string;
  unit_price?: number;
  quantity?: number;
  price?: number;
  // May not be present in old items, but required here to ensure they are added to new ones and can form part of the standardised invoice file name:
  event_name: string;
}

export interface ConfigCache {
  [ConfigElements.rates]: ConfigRatesRow[];
  [ConfigElements.services]: ConfigServicesRow[];
  [ConfigElements.contracts]: ConfigContractsRow[];
  [ConfigElements.renamingMap]: Array<[string, string]>;
  [ConfigElements.inferences]: InferenceSpecifications<
    {}, // I'm avoiding including this type as the field names are sensitive
    { event_name: string }
  >;
  [ConfigElements.transformations]: Transformations<{}, {}>;
  [ConfigElements.vat]: Array<{ rate: number; start: string }>;
  [ConfigElements.standardisation]: ConfigStandardisationRow[];
  [ConfigElements.eventCleaningTransform]: { credits: Command };
  [ConfigElements.allowedUsers]: string[];
  [ConfigElements.syntheticEvents]: SyntheticEventDefinition[];
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
  contract_id: string;
  invoice_is_quarterly: boolean;
}

export interface ConfigContractsRow {
  id: string;
  name: string;
  vendor_id: string;
}

export interface ConfigStandardisationRow {
  vendorId: string;
  invoiceStandardisationModuleId: number;
}

export type SyntheticEventType = "fixed" | "shortfall";

export type SyntheticEventFrequency = "monthly" | "quarterly";

export interface SyntheticEventDefinition {
  type: SyntheticEventType;
  event_name: string;
  shortfall_event_name?: string;
  quantity: number;
  start_date: string;
  end_date?: string;
  frequency: SyntheticEventFrequency;
  vendor_id: string;
  component_id: string;
}

export type GetConfigFile = <TFileName extends ConfigElements>(
  fileName: TFileName
) => Promise<ConfigCache[TFileName]>;

export type PickedConfigCache<TFileName extends ConfigElements> = Pick<
  ConfigCache,
  TFileName
>;

export interface FullExtractLineItem {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  event_name: string;
  contract_id: string;
  contract_name: string;
  year: string;
  month: string;
  billing_unit_price: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: string;
  invoice_is_quarterly: string;
}

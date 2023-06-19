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
  subtotal?: number;
  due_date?: string;
  tax?: number;
  tax_payer_id?: string;
  // May not be present in old items, but required here to ensure they are added to new ones:
  parser_version: string;
  originalInvoiceFile: string;
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

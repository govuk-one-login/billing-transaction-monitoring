import { StandardisedLineItem } from "../types";
import crypto from "crypto";
import { formatDateAsYearMonth } from "./date-utils";

export type LineItemFieldsForNaming = Pick<
  StandardisedLineItem,
  "event_name" | "invoice_receipt_date" | "vendor_id"
>;

export function getStandardisedInvoiceKeyPrefix(
  folder: string,
  standardisedInvoice: LineItemFieldsForNaming
): string {
  const date = new Date(standardisedInvoice.invoice_receipt_date);
  const yearMonth = formatDateAsYearMonth(date);
  const vendorId = standardisedInvoice.vendor_id;
  const eventName = standardisedInvoice.event_name;
  return `${folder}/${formatDateAsYearMonth(
    date,
    "/"
  )}/${yearMonth}-${vendorId}-${eventName}-`;
}

export function getStandardisedInvoiceKey(
  folder: string,
  standardisedInvoice: LineItemFieldsForNaming
): [string, string] {
  const uuid = crypto.randomBytes(3).toString("hex");
  const prefix = getStandardisedInvoiceKeyPrefix(folder, standardisedInvoice);
  return [`${prefix}${uuid}.txt`, prefix];
}

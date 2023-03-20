import { Textract } from "aws-sdk";
import {
  getVendorInvoiceStandardisationModuleId,
  getVendorServiceConfigRows,
  VendorServiceConfigRows,
} from "../../../shared/utils";
import { getStandardisedInvoice0 } from "./get-standardised-invoice-0";
import { getStandardisedInvoiceDefault } from "./get-standardised-invoice-default";

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
  parser_version: string; // may not be present in old items, but required here to ensure it is added to new ones
}

export interface StandardisedLineItem extends StandardisedLineItemSummary {
  item_id?: number;
  item_description?: string;
  service_name?: string;
  unit_price?: number;
  quantity?: number;
  price?: number;
}

export interface StandardisedLineItemFromPdfSummary
  extends StandardisedLineItemSummary {
  originalInvoiceFile: string; // may not be present in old items, but required here to ensure it is added to new ones
}

export type StandardisedLineItemFromPdf = StandardisedLineItem &
  StandardisedLineItemFromPdfSummary;

export type StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  vendorServiceConfigRows: VendorServiceConfigRows,
  parserVersion: string,
  originalInvoiceFile: string
) => StandardisedLineItemFromPdf[];

const standardisationModuleMap: Record<number, StandardisationModule> = {
  0: getStandardisedInvoice0,
};

export const getStandardisedInvoice = async (
  textractPages: Textract.ExpenseDocument[],
  vendorId: string,
  configBucket: string,
  parserVersions: Record<string, string>,
  originalInvoiceFileName: string
): Promise<StandardisedLineItemFromPdf[]> => {
  const vendorServiceConfigRows = await getVendorServiceConfigRows(
    configBucket,
    { vendor_id: vendorId }
  );
  const standardisationModuleId = await getVendorInvoiceStandardisationModuleId(
    configBucket,
    vendorId
  );

  const standardisationModule =
    standardisationModuleId !== undefined &&
    standardisationModuleId in standardisationModuleMap
      ? standardisationModuleMap[standardisationModuleId]
      : getStandardisedInvoiceDefault;

  const parserVersion =
    standardisationModuleId !== undefined &&
    standardisationModuleId in parserVersions
      ? parserVersions[standardisationModuleId]
      : parserVersions.default;

  return standardisationModule(
    textractPages,
    vendorServiceConfigRows,
    parserVersion,
    originalInvoiceFileName
  );
};

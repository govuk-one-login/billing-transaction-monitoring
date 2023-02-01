import { Textract } from "aws-sdk";
import {
  getVendorInvoiceStandardisationModuleId,
  getVendorServiceConfigRow,
} from "../../../shared/utils";
import { getStandardisedInvoice0 } from "./get-standardised-invoice-0";
import { getStandardisedInvoiceDefault } from "./get-standardised-invoice-default";

export interface StandardisedLineItem {
  invoice_receipt_id: string;
  vendor_name?: string;
  total: number;
  invoice_receipt_date: string;
  subtotal?: number;
  due_date?: string;
  tax?: number;
  tax_payer_id?: string;
  item_id?: number;
  item_description?: string;
  service_name?: string;
  unit_price?: number;
  quantity?: number;
  price?: number;
}

export type StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  vendorName: string
) => StandardisedLineItem[];

const standardisationModuleMap: Record<number, StandardisationModule> = {
  0: getStandardisedInvoice0,
};

export const getStandardisedInvoice = async (
  textractPages: Textract.ExpenseDocument[],
  clientId: string,
  configBucket: string
): Promise<StandardisedLineItem[]> => {
  const [standardisationModuleId, vendorServiceConfigRow] = await Promise.all([
    getVendorInvoiceStandardisationModuleId(configBucket, clientId),
    getVendorServiceConfigRow(configBucket, { client_id: clientId }),
  ]);

  const standardisationModule =
    standardisationModuleId !== undefined &&
    standardisationModuleId in standardisationModuleMap
      ? standardisationModuleMap[standardisationModuleId]
      : getStandardisedInvoiceDefault;

  return standardisationModule(
    textractPages,
    vendorServiceConfigRow.vendor_name
  );
};

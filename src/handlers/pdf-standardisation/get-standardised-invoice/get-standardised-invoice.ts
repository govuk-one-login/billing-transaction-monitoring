import { Textract } from "aws-sdk";
import { StandardisedLineItem } from "../../../shared/types";
import {
  getVendorInvoiceStandardisationModuleId,
  getVendorServiceConfigRows,
  VendorServiceConfigRows,
} from "../../../shared/utils";
import { getStandardisedInvoice0 } from "./get-standardised-invoice-0";
import { getStandardisedInvoiceDefault } from "./get-standardised-invoice-default";

export type StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  vendorServiceConfigRows: VendorServiceConfigRows,
  parserVersion: string,
  originalInvoiceFile: string
) => StandardisedLineItem[];

const standardisationModuleMap: Record<number, StandardisationModule> = {
  0: getStandardisedInvoice0,
};

export const getStandardisedInvoice = async (
  textractPages: Textract.ExpenseDocument[],
  vendorId: string,
  configBucket: string,
  parserVersions: Record<string, string>,
  originalInvoiceFileName: string
): Promise<StandardisedLineItem[]> => {
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

import { Textract } from "aws-sdk";
import { ConfigServicesRow, StandardisedLineItem } from "../../../shared/types";
import {
  getVendorInvoiceStandardisationModuleId,
  getVendorServiceConfigRows,
} from "../../../shared/utils";
import { getStandardisedInvoice0 } from "./get-standardised-invoice-0";
import { getStandardisedInvoiceDefault } from "./get-standardised-invoice-default";

export type StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  vendorServiceConfigRows: ConfigServicesRow[],
  parserVersion: string,
  originalInvoiceFile: string
) => StandardisedLineItem[];

const standardisationModuleMap: Record<number, StandardisationModule> = {
  0: getStandardisedInvoice0,
};

export const getStandardisedInvoice = async (
  textractPages: Textract.ExpenseDocument[],
  vendorId: string,
  parserVersions: Record<string, string>,
  originalInvoiceFileName: string
): Promise<StandardisedLineItem[]> => {
  const vendorServiceConfigRows = await getVendorServiceConfigRows({
    vendor_id: vendorId,
  });
  const standardisationModuleId = await getVendorInvoiceStandardisationModuleId(
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

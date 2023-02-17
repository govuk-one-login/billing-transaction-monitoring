import { InvoiceData } from "./types";
import { S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { configStackName, runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";
import { getVendorServiceConfigRow } from "../../../../../shared/utils/config-utils";

export const createInvoiceInS3 = async (
  invoiceData: InvoiceData,
  filename: string
): Promise<S3Object> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "createInvoiceInS3",
      invoiceData
    )) as unknown as S3Object;

  const invoice = new Invoice(invoiceData);

  const { vendor_id: vendorId } = await getVendorServiceConfigRow(
    configStackName(),
    { vendor_name: invoice.vendor.name }
  );

  return await makeMockInvoicePDF(writeInvoiceToS3)(
    invoice,
    vendorId,
    filename
  );
};

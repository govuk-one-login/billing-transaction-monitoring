import { S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { configStackName, runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";
import { getVendorServiceConfigRow } from "../../../../../shared/utils/config-utils";
import { InvoiceData } from "./types";
import { IntTestHelpers } from "../../../handler";

interface InvoiceDataAndFileName {
  invoiceData: InvoiceData;
  filename: string;
}

export const createInvoiceInS3 = async (
  params: InvoiceDataAndFileName
): Promise<S3Object> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.createInvoiceInS3,
      params
    )) as unknown as S3Object;

  const invoice = new Invoice(params.invoiceData);

  const { vendor_id: vendorId } = await getVendorServiceConfigRow(
    configStackName(),
    { vendor_name: invoice.vendor.name }
  );
  return await makeMockInvoicePDF(writeInvoiceToS3)(
    invoice,
    vendorId,
    params.filename
  );
};

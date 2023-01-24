import { InvoiceData } from "./types";
import { S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";

export const createInvoiceInS3 = async (
  invoiceData: InvoiceData
): Promise<S3Object> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "createInvoiceInS3",
      invoiceData
    )) as unknown as S3Object;

  const invoice = new Invoice(invoiceData);

  return await makeMockInvoicePDF(writeInvoiceToS3)(
    invoice,
    invoice.vendor.name
  );
};

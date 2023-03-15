import { S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";
import { InvoiceData } from "./types";
import { IntTestHelpers } from "../../../handler";
import { randomLineItem, randomInvoice } from "./random";
import { TestData } from "../../../testDataHelper";

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

  return await makeMockInvoicePDF(writeInvoiceToS3)(
    invoice,
    invoice.vendor.id,
    params.filename
  );
};

export const createInvoiceWithGivenData = (
  { eventTime, billingQty }: TestData,
  description: string,
  unitPrice: number,
  vendorId: string,
  vendorName: string
): InvoiceData => {
  const givenBillingQty = billingQty;
  const lineItems = randomLineItem({
    description,
    quantity: givenBillingQty,
    unitPrice,
  });

  const givenInvoice = randomInvoice({
    vendor: {
      id: vendorId,
      name: vendorName,
    },
    date: new Date(eventTime),
    lineItems: [lineItems],
  });
  return givenInvoice;
};

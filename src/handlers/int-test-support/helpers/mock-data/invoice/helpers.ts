import { S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF, makeMockInvoiceCSV } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";
import { InvoiceData } from "./types";
import { IntTestHelpers } from "../../../handler";
import { randomLineItem, randomInvoice, randomString } from "./random";
import { TestData } from "../../testDataHelper";

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

  if (params.filename.endsWith("pdf")) {
    return await makeMockInvoicePDF(writeInvoiceToS3)(
      invoice,
      invoice.vendor.id,
      params.filename
    );
  } else if (params.filename.endsWith("csv")) {
    return await makeMockInvoiceCSV(writeInvoiceToS3)(
      invoice,
      invoice.vendor.id,
      params.filename
    );
  } else {
    throw new Error("Invalid file extension. Only .pdf and .csv are allowed");
  }
};

export const createInvoiceWithGivenData = async (
  { eventTime, billingQty }: TestData,
  description: string,
  unitPrice: number,
  vendorId: string,
  vendorName: string,
  fileExtension: "pdf" | "csv"
): Promise<S3Object> => {
  const givenBillingQty = billingQty;
  const lineItems = randomLineItem({
    description,
    quantity: givenBillingQty,
    unitPrice,
  });

  const invoiceData = randomInvoice({
    vendor: {
      id: vendorId,
      name: vendorName,
    },
    date: new Date(eventTime),
    lineItems: [lineItems],
  });
  const filename = `e2e-test-raw-Invoice-validFile-${randomString(
    8
  )}.${fileExtension}`;
  return await createInvoiceInS3({ invoiceData, filename });
};

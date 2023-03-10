import { listS3Objects, S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { resourcePrefix, runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";
import { InvoiceData } from "./types";
import { IntTestHelpers } from "../../../handler";
import { poll } from "../../commonHelpers";
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

export const createInvoiceWithGivenData = async (
  { eventTime, billingQty }: TestData,
  description: string,
  unitPrice: number,
  vendorId: string,
  vendorName: string,
  testStartTime: Date
): Promise<string> => {
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

  const filename = `raw-Invoice-${Math.random()
    .toString(36)
    .substring(2, 7)}-validFile.pdf`;

  await createInvoiceInS3({ invoiceData: givenInvoice, filename });

  const prefix = resourcePrefix();
  const bucketName = `${prefix}-storage`;
  await poll(
    async () =>
      await listS3Objects({
        bucketName,
        prefix: "btm_billing_standardised",
      }),
    ({ Contents }) =>
      !!Contents?.some(
        (s3Object) =>
          s3Object.LastModified !== undefined &&
          new Date(s3Object.LastModified) >= testStartTime
      ),
    {
      timeout: 60000,
      nonCompleteErrorMessage:
        "Invoice data never appeared in standardised folder",
    }
  );

  return filename;
};

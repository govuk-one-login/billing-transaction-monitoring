import { checkIfS3ObjectExists, listS3Objects, S3Object } from "../../s3Helper";
import { Invoice, makeMockInvoicePDF, makeMockInvoiceCSV } from "./invoice";
import { writeInvoiceToS3 } from "./writers";
import { resourcePrefix, runViaLambda } from "../../envHelper";
import { sendLambdaCommand } from "../../lambdaHelper";
import { InvoiceData } from "./types";
import { IntTestHelpers } from "../../../types";
import { randomLineItem, randomString, randomInvoiceData } from "./random";
import { TestData } from "../../testDataHelper";
import { E2ETestParserServiceConfig } from "../../../config-utils/get-e2e-test-config";
import { poll } from "../../commonHelpers";
import { getQuarterMonthFromDate, padZero } from "../../dateHelper";

type InvoiceDataAndFileName = {
  invoiceData: InvoiceData;
  filename: string;
};

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
  { invoiceDate, billingQty }: TestData,
  description: string,
  unitPrice: number,
  vendorId: string,
  vendorName: string,
  fileExtension: "pdf" | "csv",
  isQuarterly: boolean = false
): Promise<InvoiceDataAndFileName> => {
  const givenBillingQty = billingQty;
  const lineItems = randomLineItem({
    description,
    quantity: givenBillingQty,
    unitPrice,
  });

  const invoiceData = randomInvoiceData({
    vendor: {
      id: vendorId,
      name: vendorName,
    },
    date: new Date(invoiceDate),
    lineItems: [lineItems],
    isQuarterly,
  });
  const filename = `e2e-test-raw-Invoice-validFile-${randomString(
    8
  )}.${fileExtension}`;
  return { invoiceData, filename };
};

const getLineItemPrefix = (
  date: Date,
  vendorId: string,
  eventName: string,
  archived: boolean,
  quarterly: boolean
): string => {
  const year = date.getFullYear();
  const month = quarterly ? getQuarterMonthFromDate(date) : date.getMonth() + 1;
  const monthText = padZero(month);
  const filePrefix = `${year}-${monthText}-${vendorId}-${eventName}-`;

  return archived
    ? `btm_invoice_data_archived/${filePrefix}`
    : `btm_invoice_data/${year}/${monthText}/${filePrefix}`;
};

export const checkStandardised = async (
  date: Date,
  vendorId: string,
  serviceConfig: E2ETestParserServiceConfig,
  itemDescription: string,
  {
    archived = false,
    keyToExclude = undefined,
    quarterly = false,
  }: { archived?: boolean; keyToExclude?: string; quarterly?: boolean } = {}
): Promise<S3Object> => {
  const bucket = `${resourcePrefix()}-storage`;

  const prefix = getLineItemPrefix(
    date,
    vendorId,
    serviceConfig.event_name,
    archived,
    quarterly
  );
  const s3Response = await poll(
    async () => await listS3Objects({ bucketName: bucket, prefix }),

    (Contents) =>
      Contents.filter((result) => result.key !== keyToExclude).length === 1,

    {
      interval: 20000,
      notCompleteErrorMessage: `Item: ${itemDescription} prefix:${prefix} not found`,
      timeout: 280000,
    }
  );
  const result = s3Response?.[0];
  if (result?.key === undefined) throw new Error("Empty line item data");
  return { bucket, key: result.key };
};

export const checkForRawInvoice = async (
  vendorId: string,
  fileName: string
): Promise<boolean> =>
  await checkIfS3ObjectExists({
    key: `${vendorId}/${fileName}`,
    bucket: `${resourcePrefix()}-raw-invoice`,
  });

export const waitForRawInvoice = async (
  vendorId: string,
  fileName: string
): Promise<boolean> =>
  await poll(
    async () => await checkForRawInvoice(vendorId, fileName),
    (resolution) => resolution,
    {
      timeout: 60000,
      notCompleteErrorMessage: `Not found in raw invoice bucket: ${vendorId}/${fileName}`,
    }
  );

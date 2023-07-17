import { getE2ETestConfig } from "../config-utils/get-e2e-test-config";
import { resourcePrefix } from "./envHelper";
import {
  makeMockInvoicePdfData,
  Invoice,
  makeMockInvoiceCSVData,
} from "./mock-data/invoice";
import { InvoiceData } from "./mock-data/invoice/types";

export const getEmailAddresses = async (): Promise<{
  sourceEmail: string;
  toEmail: string;
}> => {
  const prefix = resourcePrefix();
  const extractedEnvValue = prefix.split("-").pop();

  if (extractedEnvValue === undefined) {
    throw new Error("Env is undefined");
  }
  let sourceEmail = "";
  let toEmail = "";
  if (
    extractedEnvValue.includes("dev") ||
    extractedEnvValue.includes("build")
  ) {
    sourceEmail = `no-reply@btm.${extractedEnvValue}.account.gov.uk`;
    toEmail = `vendor1_invoices@btm.${extractedEnvValue}.account.gov.uk`;
  } else if (
    extractedEnvValue?.includes("staging") ||
    extractedEnvValue?.includes("integration")
  ) {
    sourceEmail = `no-reply@btm.${extractedEnvValue}.account.gov.uk`;
    toEmail = (await getE2ETestConfig()).parser_0_toEmailId;
  } else {
    console.error(`Email domains are not exists for the given ${prefix}`);
  }
  return { sourceEmail, toEmail };
};

export const encodeAttachment = (
  invoiceData: InvoiceData,
  filename: string
): string => {
  let attachment = "";
  let attachmentContentType = "";
  if (filename.endsWith(".pdf")) {
    const pdfInvoice = makeMockInvoicePdfData(new Invoice(invoiceData));
    const pdfInvoiceBuffer = Buffer.from(pdfInvoice, "ascii");
    attachment = pdfInvoiceBuffer.toString("base64");
    attachmentContentType = "application/pdf";
  } else if (filename.endsWith(".csv")) {
    const csvInvoice = makeMockInvoiceCSVData(new Invoice(invoiceData));
    const csvInvoiceBuffer = Buffer.from(csvInvoice, "ascii");
    attachment = csvInvoiceBuffer.toString("base64");
    attachmentContentType = "text/csv";
  }

  const attachmentString = [
    `Content-Type:${attachmentContentType}`,
    'Content-Disposition: attachment; filename="' + filename + '"',
    "Content-Transfer-Encoding: base64",
    "",
    attachment,
  ].join("\n");

  return attachmentString;
};

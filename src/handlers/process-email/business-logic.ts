import { BusinessLogic } from "../../handler-context";
import { EmailAttachment, Env } from "./types";
import { simpleParser } from "mailparser";

export const businessLogic: BusinessLogic<
  string,
  Env,
  never,
  EmailAttachment
> = async (event, { logger }, meta) => {
  logger.info(`Processing email ${JSON.stringify(event)}`);

  // File must be in a vendor ID folder in the Raw Email bucket, which determines folder for the Raw Invoice bucket. Throw error otherwise.
  const typedMeta = meta as {
    bucketName: string;
    key: string;
  };
  const filePathParts = typedMeta.key.split("/");
  if (filePathParts.length < 2)
    throw Error(
      `File not in vendor ID folder: ${typedMeta.bucketName}/${typedMeta.key}`
    );

  const vendorId = filePathParts[0];
  const sourceFileName = filePathParts[filePathParts.length - 1]; // An email with spaces in the subject line errors, check with Gareth
  logger.info(`Vendor: ${vendorId} | Email name: ${sourceFileName}`);

  // Parse the email using mailparser

  const parsedEmail = await simpleParser(event);
  console.log(parsedEmail);
  const attachments = parsedEmail.attachments;
  console.log(attachments);
  // Extract attachments that are pdf or csv from the email
  const desiredAttachments = attachments.filter(
    (attachment) =>
      attachment.contentType === "application/pdf" ||
      attachment.contentType === "text/csv"
  );

  if (!desiredAttachments.length) {
    throw Error(`No pdf or csv attachments in ${sourceFileName}`);
  }

  const attachmentContent = desiredAttachments.map((attachment) => ({
    content: attachment.content.toString(),
    vendorId,
    attachmentName: attachment.filename,
  }));
  console.log("content", attachmentContent[0].content.toString());

  // Return attachments and folder/filename
  return attachmentContent;
};

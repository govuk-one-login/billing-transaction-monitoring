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
  const sourceFileName = filePathParts[filePathParts.length - 1]; // TO DO Remove spaces in the email name?, check with Gareth
  logger.info(`Vendor: ${vendorId}`);
  logger.info(`Email name: ${sourceFileName}`);

  // Parse the email using mailparser

  const parsedEmail = await simpleParser(event);
  const attachments = parsedEmail.attachments;

  // Extract attachments that are pdf or csv from the email
  const desiredAttachments = attachments.filter(
    (attachment) =>
      attachment.contentType === "application/pdf" ||
      attachment.contentType === "text/csv"
  );

  const attachmentContent = desiredAttachments.map((attachment) => ({
    content: attachment.content.toString(),
    vendorId,
    attachmentName: attachment.filename,
  }));

  // To Do Reduce

  // Return attachments and folder/filename
  return attachmentContent;
};

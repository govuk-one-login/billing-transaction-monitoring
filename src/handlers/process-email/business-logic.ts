import { BusinessLogic } from "../../handler-context";
import { EmailAttachment, Env } from "./types";
import { simpleParser } from "mailparser";

export const businessLogic: BusinessLogic<
  string,
  Env,
  never,
  EmailAttachment
> = async (event, { logger }, meta) => {
  logger.info(`Processing email ${JSON.stringify(event)}`); // TO DO Remove logger and add decryption of email which is covered in BTM-575.

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
  const sourceFileName = filePathParts[filePathParts.length - 1];
  logger.info(`Vendor: ${vendorId} | Email name: ${sourceFileName}`);

  // Parse the email using mailparser

  const parsedEmail = await simpleParser(event);
  const attachments = parsedEmail.attachments;

  // Extract attachments that are pdf or csv from the email
  const desiredAttachments = attachments.filter(
    (attachment) =>
      attachment.contentType === "application/pdf" ||
      attachment.contentType === "text/csv"
  );

  if (!desiredAttachments.length) {
    throw Error(`No pdf or csv attachments in ${sourceFileName}`);
  }

  const attachmentContent = desiredAttachments.map((attachment) => {
    let attachmentName;
    if (attachment.filename) {
      // This will remove any whitespaces in the filename
      attachmentName = attachment.filename.replace(/\s+/g, "");
    }
    return {
      content: attachment.content.toString(),
      vendorId,
      attachmentName,
    };
  });
  // Return attachments and folder/filename
  return attachmentContent;
};

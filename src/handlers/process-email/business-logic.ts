import { BusinessLogic } from "../../handler-context";
import { EmailAttachment, Env } from "./types";
import { simpleParser } from "mailparser";

export const businessLogic: BusinessLogic<
  string,
  Env,
  never,
  EmailAttachment
> = async (event, { logger }, meta) => {
  // File must be in a vendor ID folder in the Raw Email bucket, which determines folder for the Raw Invoice bucket. Throw error otherwise.
  let vendorId: string;
  let sourceFileName: string;
  if (meta?.key && meta?.bucketName) {
    const filePathParts = meta.key.split("/");
    if (filePathParts.length < 2)
      throw Error(
        `File not in vendor ID folder: ${meta.bucketName}/${meta.key}`
      );

    vendorId = filePathParts[0];
    sourceFileName = filePathParts[filePathParts.length - 1];
    logger.info(`Vendor: ${vendorId} | Email name: ${sourceFileName}`);
  } else {
    throw Error(`Missing bucketName and/or key`);
  }

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
    logger.warn(`No pdf or csv attachments in ${sourceFileName}`);
  }

  const attachmentContent = desiredAttachments.map((attachment) => {
    let attachmentName;
    if (attachment.filename) {
      // This will remove any whitespaces in the filename
      attachmentName = attachment.filename.replace(/\s+/g, "");
    } else {
      // This will generate a filename using the attachment checksum if filename is undefined
      attachmentName = `${attachment.checksum}.${attachment.contentType.slice(
        -3
      )}`;
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

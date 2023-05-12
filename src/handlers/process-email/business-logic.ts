import { BusinessLogic } from "../../handler-context";
import { Env } from "./types";

export const businessLogic: BusinessLogic<string, Env, never, string> = async (
  event,
  { logger },
  meta
) => {
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
  const sourceFileName = filePathParts[filePathParts.length - 1];
  logger.info(`Vendor: ${vendorId}`); // To be deleted
  logger.info(`File name: ${sourceFileName}`); // To be deleted

  // Extract attachments from the email
  // Filter attachments that are pdf or csv
  // Return attachments and folder/filename
  return [event];
};

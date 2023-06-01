import { putTextS3 } from "../../shared/utils";
import { EmailAttachment } from "./types";

export const store = async (
  bucket: string,
  message: EmailAttachment
): Promise<void> => {
  const { vendorId, attachmentName, content } = message;
  await putTextS3(bucket, `${vendorId}/${attachmentName}`, content);
};

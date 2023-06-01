export enum Env {
  DESTINATION_BUCKET = "DESTINATION_BUCKET",
}

export interface EmailAttachment {
  content: string;
  vendorId: string;
  attachmentName: string | undefined;
}

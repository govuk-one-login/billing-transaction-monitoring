export enum Env {
  DESTINATION_BUCKET = "DESTINATION_BUCKET",
}

export interface EmailAttachment {
  content: Uint8Array;
  vendorId: string;
  attachmentName: string | undefined;
}

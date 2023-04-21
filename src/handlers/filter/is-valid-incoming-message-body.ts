import { MessageBody } from "./types";

export const isValidIncomingMessageBody = (
  maybeIncomingMessageBody: unknown
): maybeIncomingMessageBody is MessageBody =>
  typeof maybeIncomingMessageBody === "object" &&
  maybeIncomingMessageBody !== null &&
  "event_name" in maybeIncomingMessageBody &&
  typeof maybeIncomingMessageBody?.event_name === "string";

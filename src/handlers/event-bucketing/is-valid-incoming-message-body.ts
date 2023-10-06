import { MessageBody } from "./types";

export const isValidIncomingMessageBody = (
  maybeIncomingMessageBody: unknown
): maybeIncomingMessageBody is MessageBody =>
  !maybeIncomingMessageBody ||
  (typeof maybeIncomingMessageBody === "object" &&
    maybeIncomingMessageBody !== null &&
    "start_date" in maybeIncomingMessageBody &&
    typeof maybeIncomingMessageBody.start_date === "string" &&
    "end_date" in maybeIncomingMessageBody &&
    typeof maybeIncomingMessageBody.end_date === "string");

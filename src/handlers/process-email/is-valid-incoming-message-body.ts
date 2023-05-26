export const isValidIncomingMessageBody = (
  maybeIncomingMessageBody: unknown
): maybeIncomingMessageBody is string =>
  typeof maybeIncomingMessageBody === "string";

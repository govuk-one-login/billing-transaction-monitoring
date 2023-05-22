export const isValidIncomingMessageBody = (
  maybeIncomingMessageBody: unknown
): maybeIncomingMessageBody is string =>
  typeof maybeIncomingMessageBody === "string" &&
  maybeIncomingMessageBody.includes("MIME-Version");

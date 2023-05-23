export const isValidIncomingMessageBody = (
  maybeIncomingMessageBody: unknown
): maybeIncomingMessageBody is string =>
  typeof maybeIncomingMessageBody === "string" &&
  maybeIncomingMessageBody.includes("MIME-Version"); // This will need updating as part of BTM-575 that will extend the functionality of this handler.

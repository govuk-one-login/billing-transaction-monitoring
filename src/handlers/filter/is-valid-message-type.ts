import { Message } from "./types";

export const isValidMessageType = (
  maybeMessage: any
): maybeMessage is Message =>
  !!maybeMessage?.event_name && typeof maybeMessage?.event_name === "string";

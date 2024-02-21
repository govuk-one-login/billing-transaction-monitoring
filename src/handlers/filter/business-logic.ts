import { BusinessLogic } from "../../handler-context";
import { ConfigCache, Env, MessageBody } from "./types";

export const businessLogic: BusinessLogic<
  MessageBody,
  Env,
  ConfigCache,
  MessageBody
> = async (messageBody, { config: { services } }) => {
  const validEventNames = new Set<string>(
    services.map(({ event_name }) => event_name)
  );

  let valid: boolean;

  valid = validEventNames.has(messageBody.event_name);

  // If the driving permit is set, only allow DVLA events to be counted
  if (
    valid &&
    messageBody.restricted !== undefined &&
    messageBody.restricted.drivingPermit !== undefined
  ) {
    valid = messageBody.restricted.drivingPermit.issuedBy[0] === "DVLA";
  }

  return valid ? [messageBody] : [];
};

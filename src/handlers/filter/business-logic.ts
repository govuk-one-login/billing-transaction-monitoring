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
  if (valid && messageBody.restricted !== undefined) {
    valid = messageBody.restricted.drivingPermit[0].issuedBy === "DVLA";
  }

  return valid ? [messageBody] : [];
};

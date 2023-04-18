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

  return validEventNames.has(messageBody.event_name) ? [messageBody] : [];
};

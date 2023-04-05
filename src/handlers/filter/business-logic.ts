import { BusinessLogic } from "../../handler-context";
import { ConfigCache, Env, Message } from "./types";

export const businessLogic: BusinessLogic<Message, Env, ConfigCache> = async ({
  messages,
  config: { services },
}) => {
  const validEventNames = new Set<string>(
    services.map(({ event_name }) => event_name)
  );

  return messages.filter(({ event_name }) => validEventNames.has(event_name));
};

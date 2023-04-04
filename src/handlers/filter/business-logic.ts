import { BusinessLogic } from "../../handler-context";
import { ConfigFiles, Env, Message } from "./types";

export const businessLogic: BusinessLogic<Message, Env, ConfigFiles> = async ({
  messages,
  config: { services },
}) => {
  const validEventNames = new Set<string>(
    services.map(({ event_name }) => event_name)
  );

  return messages.filter(({ event_name }) => validEventNames.has(event_name));
};

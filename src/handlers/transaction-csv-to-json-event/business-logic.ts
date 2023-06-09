import { BusinessLogic } from "../../handler-context";
import { convert } from "./convert";
import { Env, ConfigCache } from "./types";
import { MessageBody } from "../filter/types";

export const businessLogic: BusinessLogic<
  string,
  Env,
  ConfigCache,
  MessageBody
> = async (message, { config, logger }) => {
  const events = await convert(message, config);

  const validEvents = events.filter(
    ({ event_name }) => event_name !== "Unknown"
  );

  const invalidEventCount = events.length - validEvents.length;

  if (invalidEventCount > 0) {
    logger.warn(`${invalidEventCount} event names could not be determined`);
  }

  return validEvents;
};

import { BusinessLogic } from "../../handler-context";
import { convertMany } from "./convert";
import { Env, ConfigCache } from "./types";
import { Message } from "../filter/types";

export const businessLogic: BusinessLogic<
  string,
  Env,
  ConfigCache,
  Message
> = async ({ messages, config, logger }) => {
  const { events, failedConversionsCount, failedEventNameInferenceCount } =
    await convertMany(messages, config);

  if (failedConversionsCount) {
    logger.warn(`${failedConversionsCount} event conversions failed`);
  }
  if (failedEventNameInferenceCount) {
    logger.warn(
      `${failedEventNameInferenceCount} event names could not be determined`
    );
  }

  return events;
};

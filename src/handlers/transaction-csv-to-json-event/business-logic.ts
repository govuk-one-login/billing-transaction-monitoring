import { BusinessLogic } from "../../handler-context";
import { convertMany } from "./convert";
import { Env, ConfigFiles } from "./types";

export const businessLogic: BusinessLogic<string, Env, ConfigFiles> = async ({
  messages,
  config,
  logger,
}) => {
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

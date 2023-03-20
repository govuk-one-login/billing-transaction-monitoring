/* eslint-disable @typescript-eslint/naming-convention */
import { buildHandler } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/Config";
import { sendRecord } from "../../shared/utils";
import { convert } from "./convert";

enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
  CONFIG_BUCKET = "CONFIG_BUCKET",
}

type ConfigFiles =
  | ConfigFileNames.renamingMap
  | ConfigFileNames.inferences
  | ConfigFileNames.transformations;

export const handler = buildHandler<string, Env, ConfigFiles>({
  envVars: [Env.OUTPUT_QUEUE_URL, Env.CONFIG_BUCKET],
  messageTypeGuard: (message: any): message is string => true, // we don't need this for the S3 ones
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  configFiles: [
    ConfigFileNames.renamingMap,
    ConfigFileNames.inferences,
    ConfigFileNames.transformations,
  ],
})(async ({ messages, config, logger }) => {
  const eventPromises = await Promise.allSettled(
    messages.map(async (message) => await convert(message, config))
  );

  // It might be nice to move this block into the converter.
  // It seems to me that the responsibility for understanding
  // this bodge around "Unknown" should not live here.
  // Also; imagine how much simpler this would be if we had
  // a csv converter that worked synchronously
  let failedConversions = 0;
  let failedEventNameInference = 0;
  const storableTransactions = eventPromises.filter((eventPromiseResult) => {
    if (eventPromiseResult.status === "rejected") {
      failedConversions++;
      return false;
    }
    eventPromiseResult.value.forEach(({ event_name }) => {
      if (event_name === "Unknown") {
        failedEventNameInference++;
      }
    });
    return true;
  });

  if (failedConversions) {
    logger.warn(`${failedConversions} event conversions failed`);
  }
  if (failedEventNameInference) {
    logger.warn(
      `${failedEventNameInference} event names could not be determined`
    );
  }

  return storableTransactions;
});

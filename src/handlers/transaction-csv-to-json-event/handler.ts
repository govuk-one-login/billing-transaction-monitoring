/* eslint-disable @typescript-eslint/naming-convention */
import { buildHandler } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/Config";
import { sendRecord } from "../../shared/utils";
import { convert } from "./convert";

interface Message {
  body: string;
}

enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
  CONFIG_BUCKET = "CONFIG_BUCKET",
}

type ConfigFiles =
  | ConfigFileNames.renamingMap
  | ConfigFileNames.inferences
  | ConfigFileNames.transformations;

export const handler = buildHandler<Message, Env, ConfigFiles>({
  envVars: [Env.OUTPUT_QUEUE_URL, Env.CONFIG_BUCKET],
  messageTypeGuard: () => true, // we don't need this for the S3 ones
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  configFiles: [
    ConfigFileNames.renamingMap,
    ConfigFileNames.inferences,
    ConfigFileNames.transformations,
  ],
})(async ({ messages, config, logger }) => {
  // This should come in on messages
  // const csv = await fetchS3(
  //   event.Records[0].s3.bucket.name,
  //   event.Records[0].s3.object.key
  // );

  const eventPromises = await Promise.allSettled(
    messages.map(async (message) => await convert(message.body, config))
  );

  // It might be nice to move this block into the converter.
  // It seems to me that the responsibility for understanding
  // this bodge around "Unknown" should not live here.
  // Also; imagine how much simpler this would be if we had
  // a csv converter that worked synchronously
  let failedConversions = 0;
  let failedEventNameInference = 0;
  const storeableTransactions = eventPromises.filter((eventPromiseResult) => {
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

  return storeableTransactions;
});

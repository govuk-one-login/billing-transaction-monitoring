/* eslint-disable @typescript-eslint/naming-convention */
import { buildHandler, BusinessLogic } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/Config/types";
import { sendRecord } from "../../shared/utils";
import { convertMany } from "./convert";

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
  CONFIG_BUCKET = "CONFIG_BUCKET",
}

export type ConfigFiles =
  | ConfigFileNames.renamingMap
  | ConfigFileNames.inferences
  | ConfigFileNames.transformations;

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

export const handler = buildHandler<string, Env, ConfigFiles>({
  envVars: [Env.OUTPUT_QUEUE_URL, Env.CONFIG_BUCKET],
  messageTypeGuard: (message: any): message is string =>
    typeof message === "string",
  outputs: [{ destination: Env.OUTPUT_QUEUE_URL, store: sendRecord }],
  configFiles: [
    ConfigFileNames.renamingMap,
    ConfigFileNames.inferences,
    ConfigFileNames.transformations,
  ],
})(businessLogic);

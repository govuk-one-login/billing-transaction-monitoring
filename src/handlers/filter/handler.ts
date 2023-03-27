import { buildHandler, BusinessLogic } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/Config/types";
import { sendRecord } from "../../shared/utils";

enum FilterEnv {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

interface FilterableMessage {
  event_name: string;
}

type FilterConfigFiles = ConfigFileNames.services;

const businessLogic: BusinessLogic<
  FilterableMessage,
  FilterEnv,
  FilterConfigFiles
> = async ({ messages, config: { services } }) => {
  const validEventNames = new Set<string>(
    services.map(({ event_name }) => event_name)
  );

  return messages.filter(({ event_name }) => validEventNames.has(event_name));
};

export const handler = buildHandler<
  FilterableMessage,
  FilterEnv,
  FilterConfigFiles
>({
  envVars: [FilterEnv.OUTPUT_QUEUE_URL],
  messageTypeGuard: (maybeMessage: any): maybeMessage is FilterableMessage =>
    !!maybeMessage?.event_name,
  outputs: [{ destination: FilterEnv.OUTPUT_QUEUE_URL, store: sendRecord }],
  configFiles: [ConfigFileNames.services],
})(businessLogic);

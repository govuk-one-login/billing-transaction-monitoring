import { buildHandler } from "../../handler-context";
import { ConfigFileNames } from "../../handler-context/Config";
import { sendRecord } from "../../shared/utils";

enum FilterEnv {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

interface FilterableMessage {
  event_name: string;
}

type FilterConfigFiles = ConfigFileNames.services;

const envVars = [FilterEnv.OUTPUT_QUEUE_URL];

const messageTypeGuard = (
  maybeMessage: any
): maybeMessage is FilterableMessage => !!maybeMessage?.event_name;

const outputs = [
  { destination: FilterEnv.OUTPUT_QUEUE_URL, store: sendRecord },
];

const configFiles: FilterConfigFiles[] = [ConfigFileNames.services];

export const handler = buildHandler<
  FilterableMessage,
  FilterEnv,
  FilterConfigFiles
>({
  envVars,
  messageTypeGuard,
  outputs,
  configFiles,
})(async ({ messages, config: { services } }) => {
  const validEventNames = new Set<string>(
    services.map(({ event_name }) => event_name)
  );

  return messages.filter(({ event_name }) => validEventNames.has(event_name));
});

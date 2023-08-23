import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";

export const businessLogic = async (
  _: unknown,
  { config, logger }: HandlerCtx<Env, any, any>
): Promise<string[]> => {
  const syntheticEventsConfig = config[ConfigElements.services];

  logger.info("Found synth events", syntheticEventsConfig);
  // look up synthetic event fig
  // for each config entry
  //    if now is within the entry time-range
  //    then collect a new synthetic event
  // return the events that we created
  return [];
};

import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { ConfigSyntheticEventsRow } from "../../shared/types";
import { CleanedEventBody } from "../clean/types";
import crypto from "crypto";

export const businessLogic = async (
  _: unknown,
  { config, logger }: HandlerCtx<Env, any, any>
): Promise<CleanedEventBody[]> => {
  logger.info("In lambda", config);

  const syntheticEventsConfig = config[
    ConfigElements.syntheticEvents
  ] as ConfigSyntheticEventsRow[];

  logger.info("synth events config");
  logger.info(JSON.stringify(syntheticEventsConfig));

  const now = Date.now();
  const events: CleanedEventBody[] = [];

  syntheticEventsConfig.forEach((configLine) => {
    logger.info(configLine.frequency);

    if (
      new Date(configLine.start_date).getUTCDate() < now &&
      (!configLine.end_date ||
        new Date(configLine.end_date).getUTCDate() > now) &&
      configLine.frequency === "monthly"
    ) {
      const event: CleanedEventBody = {
        vendor_id: configLine.vendor_id,
        event_id: crypto.randomUUID(),
        event_name: configLine.event_name,
        timestamp: now,
        timestamp_formatted: now.toLocaleString("en-gb"),
        credits: configLine.quantity,
        component_id: configLine.component_id,
      };
      logger.info(JSON.stringify(event));
      events.push(event);
    }
  });
  return events;
};

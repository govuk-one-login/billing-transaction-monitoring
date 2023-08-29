import { BusinessLogic, HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { ConfigSyntheticEventsRow } from "../../shared/types";
import { CleanedEventBody } from "../clean/types";
import crypto from "crypto";

export const businessLogic: BusinessLogic<
  CleanedEventBody,
  Env,
  never,
  CleanedEventBody
> = async (_: unknown, { config, logger }: HandlerCtx<Env, any, any>) => {
  logger.info("config", JSON.stringify(config));

  const syntheticEventsConfig = config[
    ConfigElements.syntheticEvents
  ] as ConfigSyntheticEventsRow[];

  const now = new Date();
  const events: CleanedEventBody[] = [];

  syntheticEventsConfig.forEach((configLine) => {
    if (
      new Date(configLine.start_date).getTime() < now.getTime() &&
      (!configLine.end_date ||
        new Date(configLine.end_date).getTime() > now.getTime()) &&
      configLine.frequency === "monthly"
    ) {
      const event: CleanedEventBody = {
        vendor_id: configLine.vendor_id,
        event_id: crypto.randomUUID(),
        event_name: configLine.event_name,
        timestamp: now.getTime(),
        timestamp_formatted: now.toLocaleString("en-gb"),
        credits: configLine.quantity,
        component_id: configLine.component_id,
      };
      logger.info("event", JSON.stringify(event));
      events.push(event);
    }
  });
  return events;
};

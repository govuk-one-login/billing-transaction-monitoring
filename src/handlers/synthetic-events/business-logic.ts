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
> = async (_: unknown, { config }: HandlerCtx<Env, any, any>) => {
  const syntheticEventsConfig = config[
    ConfigElements.syntheticEvents
  ] as ConfigSyntheticEventsRow[];

  const now = new Date();
  const nowTime = now.getTime();
  const nowFormatted = now.toLocaleString("en-gb");
  const events: CleanedEventBody[] = [];

  syntheticEventsConfig.forEach((configLine) => {
    if (
      new Date(configLine.start_date).getTime() < nowTime &&
      (!configLine.end_date ||
        new Date(configLine.end_date).getTime() > nowTime) &&
      configLine.frequency === "monthly"
    ) {
      const event: CleanedEventBody = {
        vendor_id: configLine.vendor_id,
        event_id: crypto.randomUUID(),
        event_name: configLine.event_name,
        timestamp: nowTime,
        timestamp_formatted: nowFormatted,
        credits: configLine.quantity,
        component_id: configLine.component_id,
      };
      events.push(event);
    }
  });
  return events;
};

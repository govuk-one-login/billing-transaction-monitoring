import { BusinessLogic } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { CleanedEventBody } from "../clean/types";
import crypto from "crypto";
import { formatDate } from "../../shared/utils";

export const businessLogic: BusinessLogic<
  unknown,
  Env,
  ConfigElements.syntheticEvents,
  CleanedEventBody
> = async (_, { config }) => {
  const syntheticEventsConfig = config[ConfigElements.syntheticEvents];

  const now = new Date();
  const nowTime = now.getTime();
  const nowFormatted = formatDate(now);
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
